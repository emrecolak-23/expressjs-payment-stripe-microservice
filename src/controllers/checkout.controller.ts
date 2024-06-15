import { Request, Response } from "express";
import { CustomRequest } from "../app";
import Stripe from "stripe";

import {
  PaymentService,
  OrderService,
  CompanyService,
  CartService,
  SubscriptionPackageService,
  CouponService,
} from "../services";

import { NotFoundError } from "../errors/not-found-error";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { PaymentsCreatedPublisher } from "../events/publishers/payments-created.publisher";
import { EventNotificationPublisher } from "../events/publishers/notification.publisher";
import { channel } from "..";

import { v4 as uuidv4 } from "uuid";

import { i18n } from "../middlewares";
import { PaymentCurrency, PaymentStatus } from "../types/payments";
import { OrderStatus } from "../types/orders";
import { SubscriptionsType } from "../types/subscription";
import { OrderDoc, PaymentsDoc } from "../models";
import { CouponDoc } from "../models";

class CheckoutController {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private companyService: CompanyService,
    private cartService: CartService,
    private packagesService: SubscriptionPackageService,
    private couponService: CouponService
  ) {}

  async createCheckoutSession(req: Request, res: Response) {
    const { orderId } = req.body;
    const { id: customerId } = req.currentUser;
    const domainUrl = process.env.WEB_APP_URL;
    const accepLanguage = "de";

    const existingOrder = await this.orderService.getOrderById(orderId);
    const stripeApi = new Stripe(process.env.STRIPE_RESTRICTED_KEY!);

    if (!existingOrder) {
      throw new NotFoundError(i18n.__("order_not_found"));
    }

    let paymentMode: "payment" | "subscription" = "payment";
    let coupon: CouponDoc | null = null;
    if (existingOrder?.couponId) {
      coupon = await this.couponService.getCouponById(existingOrder.couponId);

      if (!coupon) {
        throw new NotFoundError(i18n.__("coupon_not_found"));
      }
      const currentDate = new Date();
      if (coupon!.expirationDate < currentDate) {
        throw new NotAuthorizedError(i18n.__("coupon_expired"));
      }
    }
    let stripeCoupon: Stripe.Coupon | null = null;
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      await Promise.all(
        existingOrder.subscriptions.map(async (item: any) => {
          if (item.packageGroupId.isSeatable) {
            if (coupon && !coupon.isSubs) {
              stripeCoupon = await stripeApi.coupons.retrieve(
                coupon._id.toString()
              );
            }
            const translations =
              await this.packagesService.getTranslatedPackage(
                {
                  ...item.packageGroupId,
                  type: SubscriptionsType.GENERAL_CONSULTANCY,
                },
                accepLanguage as string
              );
            return {
              price_data: {
                currency: translations.currency,
                product_data: {
                  name: translations.title,
                  description: translations.explanation,
                },
                unit_amount: item.unitPrice * 100,
              },
              quantity: item.numberOfSeats,
            };
          } else {
            if (coupon && coupon.isSubs) {
              stripeCoupon = await stripeApi.coupons.retrieve(
                coupon._id.toString()
              );
            }
            const prices = await stripeApi.prices.list({
              active: true,
            });
            const price = prices.data.find(
              (price) => price.nickname === SubscriptionsType.INMIDI_SUBS
            );
            paymentMode = "subscription";
            return {
              price: price?.id,
              quantity: 1,
            };
          }
        })
      );

    const companyInfo = await this.companyService.findCompanyId(customerId);
    const customers = await stripeApi.customers.list({
      email: companyInfo.authorizedPersonEmail,
      limit: 1,
    });

    let customer;
    if (customers.data.length) {
      customer = customers.data[0];
    } else {
      customer = await stripeApi.customers.create({
        email: companyInfo.authorizedPersonEmail,
        name: companyInfo.companyName,
        metadata: {
          companyId: companyInfo.companyId,
        },
      });
    }
    const stripeSessionObj: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      ...(paymentMode === "payment"
        ? {
            invoice_creation: {
              enabled: true,
              invoice_data: {
                metadata: {
                  orderId,
                },
              },
            },
          }
        : {}),
      line_items,
      mode: paymentMode,
      success_url: `${domainUrl}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/dashboard/payment/cancel`,
      customer: customer.id,
      shipping_address_collection: { allowed_countries: ["TR", "GB", "DE"] },
      ...(existingOrder.couponId && {
        discounts: [{ coupon: stripeCoupon!.id }],
      }),
    };

    const session = await stripeApi.checkout.sessions.create(stripeSessionObj);
    const totalPrice = existingOrder.subscriptions.reduce(
      (acc: number, item: any) => {
        return acc + item.price;
      },
      0
    );

    await this.paymentService.createPayment({
      customerId,
      orderId,
      currency: PaymentCurrency.EUR,
      paidPrice: totalPrice,
      status: PaymentStatus.PENDING,
    });

    res.status(200).json({ sessionId: session.id, sessionUrl: session.url });
  }

  async checkOutWebhook(req: CustomRequest, res: Response) {
    const stripeApi = new Stripe(process.env.STRIPE_RESTRICTED_KEY!);
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = stripeApi.webhooks.constructEvent(
        req["rawBody"]!,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        if (!event.data.object.success_url?.includes("inmidi")) {
          return res.json({
            received: false,
            message: "Isteyim webhook event",
          });
        }
        const customerStripeId = event.data.object.customer;
        const stripeCustomer: any = await stripeApi.customers.retrieve(
          customerStripeId as string
        );

        const customer =
          await this.companyService.findCompanyByAuthorizedPersonEmail(
            stripeCustomer.email as string
          );

        if (!customer) {
          throw new NotFoundError("customer not fount");
        }
        const payment = await this.paymentService.getPaymentByCustomerId(
          customer?.companyId
        );

        if (!payment) {
          return res.status(200).json({ message: "Payment not found" });
        }

        const order = await this.orderService.getOrderById(payment.orderId);
        order!.subscriptions.map(async (subscription: any) => {
          if (subscription.packageGroupId.isSeatable) {
            await this.paymentService.updatePaymentStatus(
              payment._id,
              PaymentStatus.SUCCESS
            );
            await this.orderService.updateOrderStatus(
              payment.orderId,
              OrderStatus.PAID
            );

            await this.cartService.deleteCartByCustomerId(payment.customerId);

            new PaymentsCreatedPublisher(channel, ["payments-created"]).publish(
              {
                messageId: uuidv4(),
                type: "PAYMENTS_CREATED",
                body: {
                  packageGroupId: subscription.packageGroupId._id,
                  customerId: payment.customerId,
                  numberOfSeats: subscription.numberOfSeats,
                  paymentId: payment._id.toString(),
                },
              }
            );

            new EventNotificationPublisher(channel).publish({
              messageId: uuidv4(),
              type: "NOTIFICATION_EVENT",
              body: {
                text: `inmidi kullanıcısı ${customer.authorizedPersonName} ${subscription.packageGroupId.title} aldı.`,
                title: `Paket satın aldı`,
                type: "COMPANY_INFO",
              },
            });
          }
        });
      } else if (event.type === "customer.subscription.updated") {
        const eventData = event.data.object;
        const subscriptionId = eventData.id;
        const subscriptionStart = eventData.current_period_start;
        const subscriptionEnd = eventData.current_period_end;

        const formattedCurrentPeriodEnd = new Date(
          subscriptionEnd * 1000
        ).toISOString();
        const formattedCurrentPeriodStart = new Date(
          subscriptionStart * 1000
        ).toISOString();

        const subscription: any = await stripeApi.subscriptions.retrieve(
          subscriptionId as string,
          {
            expand: ["latest_invoice"],
          }
        );

        if (subscription.plan.nickname === SubscriptionsType.INMIDI_SUBS) {
          const packages = await this.packagesService.getPackageByType(
            subscription.plan.nickname
          );

          const stripeCustomer: any = await stripeApi.customers.retrieve(
            subscription.customer as string
          );

          const customer =
            await this.companyService.findCompanyByAuthorizedPersonEmail(
              stripeCustomer.email as string
            );

          if (!customer) {
            throw new NotFoundError(i18n.__("customer_not_found"));
          }

          if (eventData.cancel_at_period_end) {
            return res.status(200).json({ received: true });
          }

          let payment: PaymentsDoc | null =
            await this.paymentService.getPaymentByCustomerId(
              customer?.companyId
            );

          let order: Partial<OrderDoc> | null = null;

          if (payment) {
            console.log("order updated in webhook");

            order = await this.orderService.getOrderById(payment.orderId);
            await this.orderService.updateOrderStatus(
              order!._id,
              OrderStatus.PAID
            );

            await this.paymentService.updatePaymentStatus(
              payment._id,
              PaymentStatus.SUCCESS
            );
            await this.cartService.deleteCartByCustomerId(payment.customerId);
          } else {
            order = await this.orderService.createOrder({
              customerId: customer.companyId,
              status: OrderStatus.PAID,
              totalPrice: packages.price,
              discount: 0,
              subscriptions: [
                {
                  packageGroupId: packages._id,
                  price: packages.price,
                  unitPrice: packages.price,
                  durationType: 1,
                },
              ],
            });
            payment = await this.paymentService.createPayment({
              customerId: customer.companyId,
              paidPrice: packages.price,
              currency: "EUR",
              status: PaymentStatus.SUCCESS,
              orderId: order.id,
            });
          }

          new PaymentsCreatedPublisher(channel, ["payments-created"]).publish({
            messageId: uuidv4(),
            type: "PAYMENTS_CREATED",
            body: {
              packageGroupId: packages._id,
              customerId: payment!.customerId,
              subscriptionStart: formattedCurrentPeriodStart,
              subscriptionEnd: formattedCurrentPeriodEnd,
              paymentId: payment!._id.toString(),
            },
          });

          new EventNotificationPublisher(channel).publish({
            messageId: uuidv4(),
            type: "NOTIFICATION_EVENT",
            body: {
              text: `inmidi kullanıcısı ${customer.authorizedPersonName} ${packages.title} aldı.`,
              title: `Paket satın aldı`,
              type: "COMPANY_INFO",
            },
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.log(error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}

export { CheckoutController };
