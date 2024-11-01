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
exports.OrderController = void 0;
const moment_1 = __importDefault(require("moment"));
const not_found_error_1 = require("../errors/not-found-error");
const not_authorized_error_1 = require("../errors/not-authorized-error");
const subscription_1 = require("../types/subscription");
const success_response_1 = __importDefault(require("../responses/success-response"));
const middlewares_1 = require("../middlewares");
class OrderController {
    static getInstance(orderService, subscriptionService, cartService, paymentsService, couponService, couponUsageService) {
        if (!this.instance) {
            this.instance = new OrderController(orderService, subscriptionService, cartService, paymentsService, couponService, couponUsageService);
        }
        return this.instance;
    }
    constructor(orderService, subscriptionService, cartService, paymentsService, couponService, couponUsageService) {
        this.orderService = orderService;
        this.subscriptionService = subscriptionService;
        this.cartService = cartService;
        this.paymentsService = paymentsService;
        this.couponService = couponService;
        this.couponUsageService = couponUsageService;
    }
    createOrder(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { cartId, packages } = req.body;
            const customerId = req.currentUser.id;
            let allTotalPrice = 0;
            let cartItems;
            let discount = 0;
            let couponId;
            let coupon;
            if (!packages) {
                const cart = yield this.cartService.getCartById(cartId);
                if (!cart) {
                    throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("cart_not_found"));
                }
                if (cart === null || cart === void 0 ? void 0 : cart.couponId) {
                    coupon = yield this.couponService.getCouponById(cart.couponId);
                    const currentDate = new Date();
                    if (!coupon) {
                        throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("coupon_not_found"));
                    }
                    if ((coupon === null || coupon === void 0 ? void 0 : coupon.expirationDate) < currentDate) {
                        throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_expired"));
                    }
                    if (coupon.isOnlyForOneCompany) {
                        const isCouponUsed = yield this.couponUsageService.chekcCouponUsageForOneTime(coupon._id);
                        if (isCouponUsed) {
                            throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_only_for_one_company"));
                        }
                    }
                }
                cartItems = cart.items;
                discount = (_a = cart === null || cart === void 0 ? void 0 : cart.discount) !== null && _a !== void 0 ? _a : 0;
                couponId = cart === null || cart === void 0 ? void 0 : cart.couponId;
            }
            else {
                cartItems = packages;
            }
            const result = yield Promise.all(cartItems.map((subscription) => __awaiter(this, void 0, void 0, function* () {
                const { packageGroupId, numberOfSeats, durationType } = subscription;
                const existingPackage = yield this.subscriptionService.getSubscriptionPackage(packageGroupId);
                if (!existingPackage) {
                    throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("package_not_found"));
                }
                if (existingPackage.type === subscription_1.SubscriptionsType.GENERAL_CONSULTANCY) {
                    let totalPrice = (yield this.subscriptionService.calculatePrice({
                        packageGroupId,
                        numberOfSeats,
                    }));
                    allTotalPrice += totalPrice;
                    return {
                        packageGroupId,
                        unitPrice: existingPackage.price,
                        price: totalPrice,
                        numberOfSeats,
                    };
                }
                else if (existingPackage.type === subscription_1.SubscriptionsType.INMIDI_SUBS) {
                    let startsAt = moment_1.default.utc().startOf("day").toDate();
                    let endsAt = (coupon === null || coupon === void 0 ? void 0 : coupon.trialDuration)
                        ? moment_1.default
                            .utc()
                            .add(coupon.trialDuration, "months")
                            .endOf("day")
                            .toDate()
                        : moment_1.default.utc().add(durationType, "months").endOf("day").toDate();
                    let totalPrice = (yield this.subscriptionService.calculatePrice({
                        packageGroupId,
                        durationType,
                    }));
                    allTotalPrice += totalPrice;
                    return {
                        packageGroupId,
                        unitPrice: existingPackage.price -
                            (existingPackage.price * existingPackage.discount) / 100,
                        price: totalPrice,
                        durationType,
                        startsAt,
                        endsAt,
                    };
                }
            })));
            yield this.orderService.deleteOldOrder(customerId);
            const order = yield this.orderService.createOrder(Object.assign({ customerId, status: "pending", expiresAt: moment_1.default.utc().add(1, "day").endOf("day").toDate(), totalPrice: allTotalPrice, subscriptions: result, discount }, (couponId && { couponId })));
            res.status(201).json(new success_response_1.default(order, middlewares_1.i18n.__("order_created")));
        });
    }
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const orders = yield this.orderService.getOrders(customerId);
            res.status(200).json(orders);
        });
    }
    getOrderByCustomerId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const order = (yield this.orderService.getOrder(customerId));
            const updatedSubs = yield Promise.all(order.subscriptions.map((subscription) => __awaiter(this, void 0, void 0, function* () {
                const translatedSubs = Object.assign(Object.assign({}, subscription), { currencyPrefix: "€" });
                const updatedPackageGroupId = yield this.subscriptionService.getTranslatedPackage(translatedSubs.packageGroupId, req.headers["accept-language"]);
                return Object.assign(Object.assign({}, translatedSubs), { packageGroupId: updatedPackageGroupId });
            })));
            order.subscriptions = [...updatedSubs];
            order.discountedPrice =
                order.totalPrice - (order.totalPrice * order.discount) / 100;
            res.status(200).json(order);
        });
    }
    getCompletedOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const customerId = req.currentUser.id;
            const { orderId } = req.params;
            const order = yield this.orderService.getCompletedOrder(customerId, orderId);
            if (!order) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("order_not_found"));
            }
            const paymentMethod = yield this.paymentsService.getPaymentMethodByOrderId(orderId);
            const payments = yield this.paymentsService.getPaymentsByOrderId(orderId);
            console.log(payments, "payment");
            const resultOrder = {
                _id: order._id,
                orderNo: order.orderNo,
                customerId: order.customerId,
                status: order.status,
                cardNumber: paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod.lastFourDigits,
                price: {
                    totalPrice: order.totalPrice,
                    currency: payments[0].currency,
                    currencyPrefix: "€",
                    items: payments.map((payment) => {
                        return {
                            packageGroupId: payment.packageGroupId._id,
                            title: payment.packageGroupId.title,
                            price: payment.paidPrice,
                        };
                    }),
                },
                packages: order.subscriptions.map((subscription) => {
                    return Object.assign(Object.assign(Object.assign(Object.assign({ packageGroupId: subscription.packageGroupId._id, title: subscription.packageGroupId.title, icon: subscription.packageGroupId.icon, type: subscription.packageGroupId.type }, (subscription.numberOfSeats
                        ? { numberOfSeats: subscription.numberOfSeats }
                        : {})), (subscription.durationType
                        ? { durationType: subscription.durationType }
                        : {})), (subscription.startsAt ? { startsAt: subscription.startsAt } : {})), (subscription.endsAt ? { endsAt: subscription.endsAt } : {}));
                }),
            };
            res.status(200).json(resultOrder);
        });
    }
}
exports.OrderController = OrderController;
