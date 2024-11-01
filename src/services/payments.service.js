"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const models_1 = require("../models");
const payments_1 = require("../types/payments");
class PaymentService {
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }
    constructor() {
        this.paymentsModel = models_1.Payments;
        this.paymentsMethodModel = models_1.PaymentsMethod;
    }
    createPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = this.paymentsModel.build({
                customerId: params.customerId,
                paidPrice: params.paidPrice,
                currency: params.currency,
                paymentType: "CREDIT_CARD",
                status: params.status,
                orderId: params.orderId,
            });
            yield payment.save();
            console.log("payment", payment);
            return payment;
        });
    }
    createPaymentMethod(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cardHolderName, cardNumber, expireYear, expireMonth, cvc } = params;
            const formattedData = {
                customerId: params.customerId,
                binNumber: parseInt(cardNumber.substring(0, 6)),
                cardAssociation: "VISA",
                cardHolderName: cardHolderName,
                lastFourDigits: cardNumber.substring(cardNumber.length - 4),
                orderId: params.orderId,
            };
            const paymentMethod = this.paymentsMethodModel.build(Object.assign(Object.assign({}, formattedData), { isActive: true }));
            yield paymentMethod.save();
            return paymentMethod;
        });
    }
    getPaymentMethodByOrderId(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.paymentsMethodModel.findOne({ orderId });
        });
    }
    getPaymentsByOrderId(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentsModel.find({ orderId }).lean();
        });
    }
    getPaymentByCustomerId(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payments = yield this.paymentsModel
                .find({
                customerId,
                status: payments_1.PaymentStatus.PENDING,
            })
                .sort({ createdAt: -1 })
                .limit(1);
            console.log(payments, "payments in db");
            return payments && payments.length ? payments[0] : null;
        });
    }
    updatePaymentStatus(paymentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentsModel.updateOne({ _id: paymentId }, { $set: { status } });
        });
    }
    findExistingPaymentInHour(packageGroupId, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            date.setHours(date.getHours() - 1);
            const payment = yield this.paymentsModel
                .findOne({
                customerId,
                createdAt: { $gte: date },
                status: payments_1.PaymentStatus.SUCCESS,
            })
                .lean();
            return payment;
        });
    }
}
exports.PaymentService = PaymentService;
