"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
function paymentRoutes() {
    const paymentService = services_1.PaymentService.getInstance();
    const cartService = services_1.CartService.getInstance();
    const orderService = services_1.OrderService.getInstance();
    const subscriptionPackageService = services_1.SubscriptionPackageService.getInstance();
    const paymentController = controllers_1.PaymentController.getInstance(paymentService, subscriptionPackageService, orderService, cartService);
    const router = express_1.default.Router();
    router.use(middlewares_1.currentUser, middlewares_1.requireAuth, guards_1.isCustomer);
    router.post("/payments", paymentController.createPayment.bind(paymentController));
    return router;
}
exports.paymentRoutes = paymentRoutes;
