"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRoutes = void 0;
const express_1 = __importDefault(require("express"));
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
const checkout_controller_1 = require("../controllers/checkout.controller");
const middlewares_2 = require("../middlewares");
const checkout_1 = require("../validations/checkout");
function checkoutRoutes() {
    const paymentService = services_1.PaymentService.getInstance();
    const orderService = services_1.OrderService.getInstance();
    const companyService = services_1.CompanyService.getInstance();
    const cartService = services_1.CartService.getInstance();
    const packagesService = services_1.SubscriptionPackageService.getInstance();
    const couponService = services_1.CouponService.getInstance();
    const couponUsageService = services_1.CouponUsageService.getInstance();
    const checkoutController = new checkout_controller_1.CheckoutController(orderService, paymentService, companyService, cartService, packagesService, couponService, couponUsageService);
    const router = express_1.default.Router();
    router.post("/webhook", checkoutController.checkOutWebhook.bind(checkoutController));
    router.post("/create", middlewares_1.currentUser, middlewares_1.requireAuth, guards_1.isCustomer, (0, middlewares_2.validate)(checkout_1.createCheckoutValidation), checkoutController.createCheckoutSession.bind(checkoutController));
    return router;
}
exports.checkoutRoutes = checkoutRoutes;
