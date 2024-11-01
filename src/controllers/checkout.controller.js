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
exports.CheckoutController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const not_found_error_1 = require("../errors/not-found-error");
const not_authorized_error_1 = require("../errors/not-authorized-error");
const payments_created_publisher_1 = require("../events/publishers/payments-created.publisher");
const notification_publisher_1 = require("../events/publishers/notification.publisher");
const __1 = require("..");
const uuid_1 = require("uuid");
const middlewares_1 = require("../middlewares");
const payments_1 = require("../types/payments");
const orders_1 = require("../types/orders");
const subscription_1 = require("../types/subscription");
class CheckoutController {
    constructor(orderService, paymentService, companyService, cartService, packagesService, couponService, couponUsageService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.companyService = companyService;
        this.cartService = cartService;
        this.packagesService = packagesService;
        this.couponService = couponService;
        this.couponUsageService = couponUsageService;
    }
    createCheckoutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId } = req.body;
            const { id: customerId } = req.currentUser;
            console.log(customerId, "customerId");
            const domainUrl = process.env.WEB_APP_URL;
            const accepLanguage = "de";
            const existingOrder = yield this.orderService.getOrderById(orderId);
            const stripeApi = new stripe_1.default(process.env.STRIPE_RESTRICTED_KEY);
            if (!existingOrder) {
                throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("order_not_found"));
            }
            let paymentMode = "payment";
            let coupon = null;
            if (existingOrder === null || existingOrder === void 0 ? void 0 : existingOrder.couponId) {
                coupon = yield this.couponService.getCouponById(existingOrder.couponId);
                if (!coupon) {
                    throw new not_found_error_1.NotFoundError(middlewares_1.i18n.__("coupon_not_found"));
                }
                const currentDate = new Date();
                if (coupon.expirationDate < currentDate) {
                    throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_expired"));
                }
                if (coupon.isOnlyForOneCompany) {
                    console.log("i am here");
                    const isUsedCoupon = yield this.couponUsageService.chekcCouponUsageForOneTime(coupon._id);
                    if (isUsedCoupon) {
                        throw new not_authorized_error_1.NotAuthorizedError(middlewares_1.i18n.__("coupon_only_for_one_company"));
                    }
                }
            }
            let stripeCoupon = null;
            let subsDiscount = 0;
            const line_items = yield Promise.all(existingOrder.subscriptions.map((item) => __awaiter(this, void 0, void 0, function* () {
                if (item.packageGroupId.isSeatable) {
                    if (coupon && !coupon.isSubs) {
                        stripeCoupon = yield stripeApi.coupons.retrieve(coupon._id.toString());
                    }
                    const translations = yield this.packagesService.getTranslatedPackage(Object.assign(Object.assign({}, item.packageGroupId), { type: subscription_1.SubscriptionsType.GENERAL_CONSULTANCY }), accepLanguage);
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
                }
                else {
                    if (coupon && coupon.isSubs) {
                        stripeCoupon = yield stripeApi.coupons.retrieve(coupon._id.toString());
                    }
                    if (item.packageGroupId.discount) {
                        stripeCoupon = yield stripeApi.coupons.create({
                            percent_off: item.packageGroupId.discount,
                            duration: "once",
                            name: item.packageGroupId.title + " " + customerId,
                        });
                        subsDiscount = item.packageGroupId.discount;
                    }
                    const prices = yield stripeApi.prices.list({
                        active: true,
                    });
                    const price = prices.data.find((price) => price.nickname === subscription_1.SubscriptionsType.INMIDI_SUBS);
                    paymentMode = "subscription";
                    return {
                        price: price.id,
                        quantity: 1,
                    };
                }
            })));
            const companyInfo = yield this.companyService.findCompanyId(customerId);
            const customers = yield stripeApi.customers.list({
                email: companyInfo.authorizedPersonEmail,
                limit: 1,
            });
            let customer;
            if (customers.data.length) {
                customer = customers.data[0];
            }
            else {
                customer = yield stripeApi.customers.create({
                    email: companyInfo.authorizedPersonEmail,
                    name: companyInfo.companyName,
                    metadata: {
                        companyId: companyInfo.companyId,
                    },
                });
            }
            const stripeSessionObj = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ payment_method_types: ((coupon === null || coupon === void 0 ? void 0 : coupon.discount) === 100 && (coupon === null || coupon === void 0 ? void 0 : coupon.trialDuration)) ||
                    subsDiscount === 100
                    ? []
                    : ["card"] }, (paymentMode === "payment"
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
                : {})), { line_items, mode: paymentMode }), (subsDiscount === 100
                ? {
                    subscription_data: {
                        trial_settings: {
                            end_behavior: {
                                missing_payment_method: "cancel",
                            },
                        },
                        trial_period_days: 30 * 1,
                    },
                }
                : {})), ((coupon === null || coupon === void 0 ? void 0 : coupon.discount) === 100 && (coupon === null || coupon === void 0 ? void 0 : coupon.trialDuration) && coupon.isSubs
                ? {
                    subscription_data: {
                        trial_settings: {
                            end_behavior: {
                                missing_payment_method: "cancel",
                            },
                        },
                        trial_period_days: 30 * coupon.trialDuration,
                    },
                }
                : {})), ((coupon === null || coupon === void 0 ? void 0 : coupon.discount) === 100 && coupon.isSubs
                ? { payment_method_collection: "if_required" }
                : {})), { locale: accepLanguage, success_url: `${domainUrl}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${domainUrl}/dashboard/payment/cancel`, customer: customer.id, billing_address_collection: undefined, shipping_address_collection: undefined }), ((existingOrder.couponId || subsDiscount) && {
                discounts: [{ coupon: stripeCoupon.id }],
            }));
            const session = yield stripeApi.checkout.sessions.create(stripeSessionObj);
            const totalPrice = existingOrder.subscriptions.reduce((acc, item) => {
                return acc + item.price;
            }, 0);
            yield this.paymentService.createPayment({
                customerId,
                orderId,
                currency: payments_1.PaymentCurrency.EUR,
                paidPrice: totalPrice,
                status: payments_1.PaymentStatus.PENDING,
            });
            res.status(200).json({ sessionId: session.id, sessionUrl: session.url });
        });
    }
    checkOutWebhook(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const stripeApi = new stripe_1.default(process.env.STRIPE_RESTRICTED_KEY);
            const sig = req.headers["stripe-signature"];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            let event;
            event = stripeApi.webhooks.constructEvent(req["rawBody"], sig, endpointSecret);
            console.log(event.type, "event type");
            if (event.type === "checkout.session.completed") {
                if (!((_a = event.data.object.success_url) === null || _a === void 0 ? void 0 : _a.includes("inmidi"))) {
                    return res.status(200).json({
                        received: false,
                        message: "Isteyim webhook event",
                    });
                }
                const customerStripeId = event.data.object.customer;
                const stripeCustomer = yield stripeApi.customers.retrieve(customerStripeId);
                const customer = yield this.companyService.findCompanyByAuthorizedPersonEmail(stripeCustomer.email);
                if (!customer) {
                    return res.status(404).json({ message: "customer not found" });
                }
                const payment = yield this.paymentService.getPaymentByCustomerId(customer === null || customer === void 0 ? void 0 : customer.companyId);
                if (!payment) {
                    console.log("payment not found");
                    return res.status(200).json({ message: "Payment not found" });
                }
                const order = yield this.orderService.getOrderById(payment.orderId);
                const cart = yield this.cartService.getCarByCustomerId(payment.customerId);
                if (cart === null || cart === void 0 ? void 0 : cart.couponId) {
                    yield this.couponUsageService.updateCouponUsed(cart === null || cart === void 0 ? void 0 : cart.couponId, cart._id);
                }
                yield this.cartService.deleteCartByCustomerId(payment.customerId);
                yield Promise.all(order.subscriptions.map((subscription) => __awaiter(this, void 0, void 0, function* () {
                    if (subscription.packageGroupId.isSeatable) {
                        yield this.paymentService.updatePaymentStatus(payment._id, payments_1.PaymentStatus.SUCCESS);
                        yield this.orderService.updateOrderStatus(payment.orderId, orders_1.OrderStatus.PAID);
                        yield new payments_created_publisher_1.PaymentsCreatedPublisher(__1.channel, [
                            "payments-created",
                        ]).publish({
                            messageId: (0, uuid_1.v4)(),
                            type: "PAYMENTS_CREATED",
                            body: {
                                packageGroupId: subscription.packageGroupId._id,
                                customerId: payment.customerId,
                                numberOfSeats: subscription.numberOfSeats,
                                paymentId: payment._id.toString(),
                            },
                        });
                    }
                    else if (!subscription.packageGroupId.isSeatable &&
                        ((order === null || order === void 0 ? void 0 : order.discount) === 100 ||
                            subscription.packageGroupId.discount === 100)) {
                        yield this.paymentService.updatePaymentStatus(payment._id, payments_1.PaymentStatus.SUCCESS);
                        yield this.orderService.updateOrderStatus(payment.orderId, orders_1.OrderStatus.PAID);
                        const currentDate = new Date();
                        const subscriptionEndISO = new Date(subscription.endsAt).toISOString();
                        yield new payments_created_publisher_1.PaymentsCreatedPublisher(__1.channel, [
                            "payments-created",
                        ]).publish({
                            messageId: (0, uuid_1.v4)(),
                            type: "PAYMENTS_CREATED",
                            body: {
                                packageGroupId: subscription.packageGroupId._id,
                                customerId: payment.customerId,
                                subscriptionStart: currentDate.toISOString(),
                                subscriptionEnd: subscriptionEndISO,
                                paymentId: payment._id.toString(),
                            },
                        });
                    }
                    yield new notification_publisher_1.EventNotificationPublisher(__1.channel).publish({
                        messageId: (0, uuid_1.v4)(),
                        type: "NOTIFICATION_EVENT",
                        body: {
                            text: `inmidi kullanıcısı ${customer.authorizedPersonName} ${subscription.packageGroupId.title} aldı.`,
                            title: `Paket satın aldı`,
                            type: "COMPANY_INFO",
                        },
                    });
                })));
                return res.status(200).json({ received: true });
            }
            else if (event.type === "customer.subscription.updated") {
                console.log("i am in subscription updated");
                const eventData = event.data.object;
                const subscriptionId = eventData.id;
                const subscriptionStart = eventData.current_period_start;
                const subscriptionEnd = eventData.current_period_end;
                const formattedCurrentPeriodEnd = new Date(subscriptionEnd * 1000).toISOString();
                const formattedCurrentPeriodStart = new Date(subscriptionStart * 1000).toISOString();
                const subscription = yield stripeApi.subscriptions.retrieve(subscriptionId, {
                    expand: ["latest_invoice"],
                });
                if (subscription.plan.nickname === subscription_1.SubscriptionsType.INMIDI_SUBS) {
                    const packages = yield this.packagesService.getPackageByType(subscription.plan.nickname);
                    const stripeCustomer = yield stripeApi.customers.retrieve(subscription.customer);
                    const customer = yield this.companyService.findCompanyByAuthorizedPersonEmail(stripeCustomer.email);
                    if (!customer) {
                        return res
                            .status(404)
                            .json({ message: middlewares_1.i18n.__("customer_not_found") });
                    }
                    if (eventData.cancel_at_period_end) {
                        return res.status(200).json({ received: true });
                    }
                    let payment = yield this.paymentService.getPaymentByCustomerId(customer === null || customer === void 0 ? void 0 : customer.companyId);
                    let order = null;
                    if (payment) {
                        console.log("order updated in webhook");
                        order = yield this.orderService.getOrderById(payment.orderId);
                        yield this.orderService.updateOrderStatus(order._id, orders_1.OrderStatus.PAID);
                        yield this.paymentService.updatePaymentStatus(payment._id, payments_1.PaymentStatus.SUCCESS);
                        const cart = yield this.cartService.getCarByCustomerId(payment.customerId);
                        console.log(cart, "cart");
                        if (cart === null || cart === void 0 ? void 0 : cart.couponId) {
                            console.log("i am here");
                            yield this.couponUsageService.updateCouponUsed(cart === null || cart === void 0 ? void 0 : cart.couponId, cart._id);
                        }
                        yield this.cartService.deleteCartByCustomerId(payment.customerId);
                    }
                    else {
                        order = yield this.orderService.createOrder({
                            customerId: customer.companyId,
                            status: orders_1.OrderStatus.PAID,
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
                        payment = yield this.paymentService.createPayment({
                            customerId: customer.companyId,
                            paidPrice: packages.price,
                            currency: "EUR",
                            status: payments_1.PaymentStatus.SUCCESS,
                            orderId: order.id,
                        });
                    }
                    yield new payments_created_publisher_1.PaymentsCreatedPublisher(__1.channel, [
                        "payments-created",
                    ]).publish({
                        messageId: (0, uuid_1.v4)(),
                        type: "PAYMENTS_CREATED",
                        body: {
                            packageGroupId: packages._id,
                            customerId: payment.customerId,
                            subscriptionStart: formattedCurrentPeriodStart,
                            subscriptionEnd: formattedCurrentPeriodEnd,
                            paymentId: payment._id.toString(),
                        },
                    });
                    yield new notification_publisher_1.EventNotificationPublisher(__1.channel).publish({
                        messageId: (0, uuid_1.v4)(),
                        type: "NOTIFICATION_EVENT",
                        body: {
                            text: `inmidi kullanıcısı ${customer.authorizedPersonName} ${packages.title} aldı.`,
                            title: `Paket satın aldı`,
                            type: "COMPANY_INFO",
                        },
                    });
                }
                return res.status(200).json({ received: true });
            }
        });
    }
}
exports.CheckoutController = CheckoutController;
