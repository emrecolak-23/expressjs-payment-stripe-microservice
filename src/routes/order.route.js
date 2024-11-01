"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const services_1 = require("../services");
const services_2 = require("../services");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
const middlewares_2 = require("../middlewares");
const order_1 = require("../validations/order");
function orderRoutes() {
    const orderService = services_1.OrderService.getInstance();
    const paymentsService = services_2.PaymentService.getInstance();
    const cartService = services_2.CartService.getInstance();
    const subscriptionPackageService = services_2.SubscriptionPackageService.getInstance();
    const couponService = services_2.CouponService.getInstance();
    const couponUsageService = services_2.CouponUsageService.getInstance();
    const orderController = controllers_1.OrderController.getInstance(orderService, subscriptionPackageService, cartService, paymentsService, couponService, couponUsageService);
    const router = express_1.default.Router();
    router.use(middlewares_1.currentUser, middlewares_1.requireAuth, guards_1.isCustomer);
    router.post("/order", (0, middlewares_2.validate)(order_1.createOrderValidation), orderController.createOrder.bind(orderController));
    router.get("/orders", orderController.getOrders.bind(orderController));
    router.get("/order", orderController.getOrderByCustomerId.bind(orderController));
    router.get("/order/:orderId", orderController.getCompletedOrder.bind(orderController));
    return router;
}
exports.orderRoutes = orderRoutes;
