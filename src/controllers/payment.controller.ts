import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import {
  PaymentService,
  SubscriptionPackageService,
  OrderService,
  CartService,
} from "../services";
import SuccessResponse from "../responses/success-response";
import { PaymentsCreatedPublisher } from "../events/publishers/payments-created.publisher";
import { SubscriptionsType } from "../types/subscription";
import { channel } from "..";
import { NotFoundError } from "../errors/not-found-error";
import { i18n } from "../middlewares";
import { PaymentStatus, PaymentCurrency } from "../types/payments";
class PaymentController {
  private static instance: PaymentController;

  static getInstance(
    paymentService: PaymentService,
    subscriptionPackagesService: SubscriptionPackageService,
    orderService: OrderService,
    cartService: CartService
  ) {
    if (!this.instance) {
      this.instance = new PaymentController(
        paymentService,
        subscriptionPackagesService,
        orderService,
        cartService
      );
    }
    return this.instance;
  }

  private constructor(
    private paymentService: PaymentService,
    private subscriptionPackagesService: SubscriptionPackageService,
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  async createPayment(req: Request, res: Response) {
    const {
      cardHolderName,
      cardNumber,
      expireYear,
      expireMonth,
      cvc,
      orderId,
    } = req.body;

    const customerId = req.currentUser.id;
    const order = await this.orderService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError(i18n.__("order_not_found"));
    }

    const packages = order?.subscriptions;

    if (order?.status === "paid") {
      return res
        .status(400)
        .json(new SuccessResponse(null, i18n.__("order_already_paid")));
    }

    const result = await Promise.all(
      packages.map(
        async ({
          packageGroupId,
          numberOfSeats,
          durationType,
        }: {
          packageGroupId: any;
          numberOfSeats?: number;
          durationType?: number;
        }) => {
          const existingPackage =
            await this.subscriptionPackagesService.getSubscriptionPackage(
              packageGroupId._id
            );
          if (!existingPackage) {
            return null;
          }
          let totalPrice = 0;

          if (existingPackage.type === SubscriptionsType.GENERAL_CONSULTANCY) {
            totalPrice = (await this.subscriptionPackagesService.calculatePrice(
              {
                packageGroupId: packageGroupId._id,
                numberOfSeats,
              }
            )) as number;

            const payment = await this.paymentService.createPayment({
              customerId,
              paidPrice: totalPrice,
              orderId,
              status: PaymentStatus.SUCCESS,
              currency: PaymentCurrency.EUR,
            });

            new PaymentsCreatedPublisher(channel, ["payments-created"]).publish(
              {
                messageId: uuidv4(),
                type: "PAYMENTS_CREATED",
                body: {
                  packageGroupId: packageGroupId._id,
                  customerId,
                  numberOfSeats,
                  paymentId: payment._id.toString(),
                },
              }
            );

            return {
              packageGroupId: packageGroupId._id,
              price: totalPrice,
              numberOfSeats,
            };
          } else if (existingPackage.type === SubscriptionsType.INMIDI_SUBS) {
            totalPrice = (await this.subscriptionPackagesService.calculatePrice(
              {
                packageGroupId: packageGroupId._id,
                durationType,
              }
            )) as number;

            const payment = await this.paymentService.createPayment({
              customerId,
              paidPrice: totalPrice,
              orderId,
              status: PaymentStatus.SUCCESS,
              currency: PaymentCurrency.EUR,
            });

            new PaymentsCreatedPublisher(channel, ["payments-created"]).publish(
              {
                messageId: uuidv4(),
                type: "PAYMENTS_CREATED",
                body: {
                  packageGroupId: packageGroupId._id,
                  customerId,
                  durationType,
                  paymentId: payment._id.toString(),
                },
              }
            );

            return {
              packageGroupId: packageGroupId._id,
              price: totalPrice,
              durationType,
            };
          }
        }
      )
    );

    await this.orderService.updateOrderStatus(orderId, "paid");
    await this.cartService.deleteCartByCustomerId(customerId);
    await this.paymentService.createPaymentMethod({
      cardHolderName,
      cardNumber,
      expireYear,
      expireMonth,
      cvc,
      customerId,
      orderId,
    });

    res.status(201).json(
      new SuccessResponse(
        {
          orderId,
          payment: result,
        },
        i18n.__("payment_created")
      )
    );
  }
}

export { PaymentController };
