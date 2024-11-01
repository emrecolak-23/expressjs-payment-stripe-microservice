import {
  Payments,
  PaymentsModel,
  PaymentsMethod,
  PaymentsMethodModel,
} from "../models";
import { CreatePaymentDto, CreatePaymentMethodDto } from "../dtos";
import { PaymentStatus } from "../types/payments";

class PaymentService {
  private static instance: PaymentService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PaymentService();
    }
    return this.instance;
  }

  paymentsModel: PaymentsModel;
  paymentsMethodModel: PaymentsMethodModel;
  private constructor() {
    this.paymentsModel = Payments;
    this.paymentsMethodModel = PaymentsMethod;
  }

  async createPayment(params: CreatePaymentDto) {
    const payment = this.paymentsModel.build({
      customerId: params.customerId,
      paidPrice: params.paidPrice,
      currency: params.currency,
      paymentType: "CREDIT_CARD",
      status: params.status,
      orderId: params.orderId,
    });

    await payment.save();
    console.log("payment", payment);
    return payment;
  }

  async createPaymentMethod(params: CreatePaymentMethodDto) {
    const { cardHolderName, cardNumber, expireYear, expireMonth, cvc } = params;

    const formattedData = {
      customerId: params.customerId,
      binNumber: parseInt(cardNumber.substring(0, 6)),
      cardAssociation: "VISA",
      cardHolderName: cardHolderName,
      lastFourDigits: cardNumber.substring(cardNumber.length - 4),
      orderId: params.orderId,
    };

    const paymentMethod = this.paymentsMethodModel.build({
      ...formattedData,
      isActive: true,
    });
    await paymentMethod.save();
    return paymentMethod;
  }

  async getPaymentMethodByOrderId(orderId: string) {
    return this.paymentsMethodModel.findOne({ orderId });
  }

  async getPaymentsByOrderId(orderId: string) {
    return await this.paymentsModel.find({ orderId }).lean();
  }

  async getPaymentByCustomerId(customerId: number) {
    const payments = await this.paymentsModel
      .find({
        customerId,
        status: PaymentStatus.PENDING,
      })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(payments, "payments in db");
    return payments && payments.length ? payments[0] : null;
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    return await this.paymentsModel.updateOne(
      { _id: paymentId },
      { $set: { status } }
    );
  }

  async findExistingPaymentInHour(packageGroupId: string, customerId: number) {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    const payment = await this.paymentsModel
      .findOne({
        customerId,
        createdAt: { $gte: date },
        status: PaymentStatus.SUCCESS,
      })
      .lean();

    return payment;
  }
}

export { PaymentService };
