import express, { Router } from "express";
import { OrderService } from "../services";
import {
  SubscriptionPackageService,
  CartService,
  PaymentService,
  CouponService,
} from "../services";
import { OrderController } from "../controllers";
import { currentUser, requireAuth } from "../middlewares";
import { isCustomer } from "../guards";
import { validate } from "../middlewares";
import { createOrderValidation } from "../validations/order";

function orderRoutes(): Router {
  const orderService = OrderService.getInstance();
  const paymentsService = PaymentService.getInstance();
  const cartService = CartService.getInstance();
  const subscriptionPackageService = SubscriptionPackageService.getInstance();
  const couponService = CouponService.getInstance();
  const orderController = OrderController.getInstance(
    orderService,
    subscriptionPackageService,
    cartService,
    paymentsService,
    couponService
  );

  const router = express.Router();

  router.use(currentUser, requireAuth, isCustomer);
  router.post(
    "/order",
    validate(createOrderValidation),
    orderController.createOrder.bind(orderController)
  );
  router.get("/orders", orderController.getOrders.bind(orderController));
  router.get(
    "/order",
    orderController.getOrderByCustomerId.bind(orderController)
  );
  router.get(
    "/order/:orderId",
    orderController.getCompletedOrder.bind(orderController)
  );
  return router;
}

export { orderRoutes };
