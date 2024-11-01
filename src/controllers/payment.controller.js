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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const uuid_1 = require("uuid");
const success_response_1 = __importDefault(require("../responses/success-response"));
const payments_created_publisher_1 = require("../events/publishers/payments-created.publisher");
const subscription_1 = require("../types/subscription");
const __1 = require("..");
const not_found_error_1 = require("../errors/not-found-error");
const middlewares_1 = require("../middlewares");
const payments_1 = require("../types/payments");
class PaymentController {
    static getInstance(paymentService, subscriptionPackagesService, orderService, cartService) {
        if (!this.instance) {
            this.instance = new PaymentController(paymentService, subscriptionPackagesService, orderService, cartService);
        }
        return this.instance;
    }
    constructor(paymentService, subscriptionPackagesService, orderService, cartService) {
        this.paymentService = paymentService;
        this.subscriptionPackagesService = subscriptionPackagesService;
        this.orderService = orderService;
        this.cartService = cartService;
    }
    createPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cardHolderName, cardNumber, expireYear, expireMonth, cvc, orderId, } = req.body;
            const customerId = req.currentUser.id;
            const order = yield this.orderService.getOrderById(orderId);
            if (!order) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("order_not_found"));
            }
            const packages = order === null || order === void 0 ? void 0 : order.subscriptions;
            if ((order === null || order === void 0 ? void 0 : order.status) === "paid") {
                return res
                    .status(400)
                    .json(new success_response_1.default(null, middlewares_1.i18n.__("order_already_paid")));
            }
            const result = yield Promise.all(packages.map(({ packageGroupId, numberOfSeats, durationType, }) => __awaiter(this, void 0, void 0, function* () {
                const existingPackage = yield this.subscriptionPackagesService.getSubscriptionPackage(packageGroupId._id);
                if (!existingPackage) {
                    return null;
                }
                let totalPrice = 0;
                if (existingPackage.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY) {
                    totalPrice = (yield this.subscriptionPackagesService.calculatePrice({
                        packageGroupId: packageGroupId._id,
                        numberOfSeats,
                    }));
                    const payment = yield this.paymentService.createPayment({
                        customerId,
                        paidPrice: totalPrice,
                        orderId,
                        status: payments_1.PaymentStatus.SUCCESS,
                        currency: payments_1.PaymentCurrency.EUR,
                    });
                    new payments_created_publisher_1.PaymentsCreatedPublisher(__1.channel, ["payments-created"]).publish({
                        messageId: (0, uuid_1.v4)(),
                        type: "PAYMENTS_CREATED",
                        body: {
                            packageGroupId: packageGroupId._id,
                            customerId,
                            numberOfSeats,
                            paymentId: payment._id.toString(),
                        },
                    });
                    return {
                        packageGroupId: packageGroupId._id,
                        price: totalPrice,
                        numberOfSeats,
                    };
                }
                else if (existingPackage.type === subscription_1.SubscriptionsType.INMIDI_SUBS) {
                    totalPrice = (yield this.subscriptionPackagesService.calculatePrice({
                        packageGroupId: packageGroupId._id,
                        durationType,
                    }));
                    const payment = yield this.paymentService.createPayment({
                        customerId,
                        paidPrice: totalPrice,
                        orderId,
                        status: payments_1.PaymentStatus.SUCCESS,
                        currency: payments_1.PaymentCurrency.EUR,
                    });
                    new payments_created_publisher_1.PaymentsCreatedPublisher(__1.channel, ["payments-created"]).publish({
                        messageId: (0, uuid_1.v4)(),
                        type: "PAYMENTS_CREATED",
                        body: {
                            packageGroupId: packageGroupId._id,
                            customerId,
                            durationType,
                            paymentId: payment._id.toString(),
                        },
                    });
                    return {
                        packageGroupId: packageGroupId._id,
                        price: totalPrice,
                        durationType,
                    };
                }
            })));
            yield this.orderService.updateOrderStatus(orderId, "paid");
            yield this.cartService.deleteCartByCustomerId(customerId);
            yield this.paymentService.createPaymentMethod({
                cardHolderName,
                cardNumber,
                expireYear,
                expireMonth,
                cvc,
                customerId,
                orderId,
            });
            res.status(201).json(new success_response_1.default({
                orderId,
                payment: result,
            }, middlewares_1.i18n.__("payment_created")));
        });
    }
}
exports.PaymentController = PaymentController;
