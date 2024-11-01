import moment from "moment";
import { Request, Response } from "express";
import { SubscriptionAttrs } from "../dtos";
import { NotFoundError } from "../errors/not-found-error";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import {
  OrderService,
  SubscriptionPackageService,
  CartService,
  PaymentService,
  CouponService,
  CouponUsageService,
} from "../services";
import { SubscriptionsType } from "../types/subscription";
import SuccessResponse from "../responses/success-response";
import { i18n } from "../middlewares";
import { FlattenMaps, Types } from "mongoose";
import { CouponDoc, OrderDoc } from "../models";

interface ResultItem {
  packageGroupId: string;
  price: number;
  unitPrice: number;
  numberOfSeats?: number;
  durationType?: number;
  startsAt?: Date;
  endsAt?: Date;
}

class OrderController {
  private static instance: OrderController;

  static getInstance(
    orderService: OrderService,
    subscriptionService: SubscriptionPackageService,
    cartService: CartService,
    paymentsService: PaymentService,
    couponService: CouponService,
    couponUsageService: CouponUsageService
  ) {
    if (!this.instance) {
      this.instance = new OrderController(
        orderService,
        subscriptionService,
        cartService,
        paymentsService,
        couponService,
        couponUsageService
      );
    }
    return this.instance;
  }

  private constructor(
    private orderService: OrderService,
    private subscriptionService: SubscriptionPackageService,
    private cartService: CartService,
    private paymentsService: PaymentService,
    private couponService: CouponService,
    private couponUsageService: CouponUsageService
  ) {}

  async createOrder(req: Request, res: Response) {
    const { cartId, packages } = req.body;

    const customerId = req.currentUser.id;
    let allTotalPrice = 0;

    let cartItems;
    let discount = 0;
    let couponId: string | undefined;
    let coupon: CouponDoc | null;

    if (!packages) {
      const cart = await this.cartService.getCartById(cartId);
      if (!cart) {
        throw new NotFoundError(i18n.__("cart_not_found"));
      }

      if (cart?.couponId) {
        coupon = await this.couponService.getCouponById(cart.couponId);
        const currentDate = new Date();

        if (!coupon) {
          throw new NotFoundError(i18n.__("coupon_not_found"));
        }

        if (coupon?.expirationDate < currentDate) {
          throw new NotAuthorizedError(i18n.__("coupon_expired"));
        }

        if (coupon.isOnlyForOneCompany) {
          const isCouponUsed =
            await this.couponUsageService.chekcCouponUsageForOneTime(
              coupon._id
            );

          if (isCouponUsed) {
            throw new NotAuthorizedError(
              i18n.__("coupon_only_for_one_company")
            );
          }
        }
      }
      cartItems = cart.items;
      discount = cart?.discount ?? 0;
      couponId = cart?.couponId;
    } else {
      cartItems = packages;
    }

    const result = await Promise.all(
      cartItems!.map(async (subscription: SubscriptionAttrs) => {
        const { packageGroupId, numberOfSeats, durationType } = subscription;
        const existingPackage =
          await this.subscriptionService.getSubscriptionPackage(packageGroupId);

        if (!existingPackage) {
          throw new NotFoundError(i18n.__("package_not_found"));
        }

        if (existingPackage!.type === SubscriptionsType.GENERAL_CONSULTANCY) {
          let totalPrice = (await this.subscriptionService.calculatePrice({
            packageGroupId,
            numberOfSeats,
          })) as number;

          allTotalPrice += totalPrice;
          return {
            packageGroupId,
            unitPrice: existingPackage.price,
            price: totalPrice,
            numberOfSeats,
          };
        } else if (existingPackage!.type === SubscriptionsType.INMIDI_SUBS) {
          let startsAt = moment.utc().startOf("day").toDate();
          let endsAt = coupon?.trialDuration
            ? moment
                .utc()
                .add(coupon.trialDuration, "months")
                .endOf("day")
                .toDate()
            : moment.utc().add(durationType, "months").endOf("day").toDate();

          let totalPrice = (await this.subscriptionService.calculatePrice({
            packageGroupId,
            durationType,
          })) as number;
          allTotalPrice += totalPrice;

          return {
            packageGroupId,
            unitPrice:
              existingPackage.price -
              (existingPackage.price * existingPackage.discount!) / 100,
            price: totalPrice,
            durationType,
            startsAt,
            endsAt,
          };
        }
      })
    );

    await this.orderService.deleteOldOrder(customerId);

    const order = await this.orderService.createOrder({
      customerId,
      status: "pending",
      expiresAt: moment.utc().add(1, "day").endOf("day").toDate(),
      totalPrice: allTotalPrice,
      subscriptions: result as ResultItem[],
      discount,
      ...(couponId && { couponId }),
    });

    res.status(201).json(new SuccessResponse(order, i18n.__("order_created")));
  }

  async getOrders(req: Request, res: Response) {
    const customerId = req.currentUser.id;

    const orders = await this.orderService.getOrders(customerId);

    res.status(200).json(orders);
  }

  async getOrderByCustomerId(req: Request, res: Response) {
    const customerId = req.currentUser.id;

    const order = (await this.orderService.getOrder(
      customerId
    )) as FlattenMaps<OrderDoc> & {
      _id: Types.ObjectId;
      discountedPrice: number;
    };
    const updatedSubs = await Promise.all(
      order.subscriptions.map(
        async (
          subscription: FlattenMaps<SubscriptionAttrs>
        ): Promise<
          FlattenMaps<SubscriptionAttrs> & { currencyPrefix: string }
        > => {
          const translatedSubs: FlattenMaps<SubscriptionAttrs> & {
            currencyPrefix: string;
          } = {
            ...subscription,
            currencyPrefix: "€",
          };
          const updatedPackageGroupId =
            await this.subscriptionService.getTranslatedPackage(
              translatedSubs.packageGroupId,
              req.headers["accept-language"] as string
            );

          return {
            ...translatedSubs,
            packageGroupId: updatedPackageGroupId,
          };
        }
      )
    );

    order.subscriptions = [...updatedSubs];
    order.discountedPrice =
      order.totalPrice - (order.totalPrice * order.discount) / 100;
    res.status(200).json(order);
  }

  async getCompletedOrder(req: Request, res: Response) {
    const customerId = req.currentUser.id;
    const { orderId } = req.params;

    const order = await this.orderService.getCompletedOrder(
      customerId,
      orderId
    );

    if (!order) {
      throw new NotFoundError(i18n.__("order_not_found"));
    }

    const paymentMethod = await this.paymentsService.getPaymentMethodByOrderId(
      orderId
    );

    const payments = await this.paymentsService.getPaymentsByOrderId(orderId);
    console.log(payments, "payment");

    const resultOrder = {
      _id: order._id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      status: order.status,
      cardNumber: paymentMethod?.lastFourDigits,
      price: {
        totalPrice: order.totalPrice,
        currency: payments[0].currency,
        currencyPrefix: "€",
        items: payments.map((payment: any) => {
          return {
            packageGroupId: payment.packageGroupId._id,
            title: payment.packageGroupId.title,
            price: payment.paidPrice,
          };
        }),
      },
      packages: order.subscriptions.map((subscription: any) => {
        return {
          packageGroupId: subscription.packageGroupId._id,
          title: subscription.packageGroupId.title,
          icon: subscription.packageGroupId.icon,
          type: subscription.packageGroupId.type,
          ...(subscription.numberOfSeats
            ? { numberOfSeats: subscription.numberOfSeats }
            : {}),
          ...(subscription.durationType
            ? { durationType: subscription.durationType }
            : {}),
          ...(subscription.startsAt ? { startsAt: subscription.startsAt } : {}),
          ...(subscription.endsAt ? { endsAt: subscription.endsAt } : {}),
        };
      }),
    };

    res.status(200).json(resultOrder);
  }
}

export { OrderController };
