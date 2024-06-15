import express, { Router } from "express";
import { PaymentController } from "../controllers";
import {
  PaymentService,
  SubscriptionPackageService,
  OrderService,
  CartService,
} from "../services";

import { currentUser, requireAuth } from "../middlewares";
import { isCustomer } from "../guards";
function paymentRoutes(): Router {
  const paymentService = PaymentService.getInstance();
  const cartService = CartService.getInstance();
  const orderService = OrderService.getInstance();
  const subscriptionPackageService = SubscriptionPackageService.getInstance();
  const paymentController = PaymentController.getInstance(
    paymentService,
    subscriptionPackageService,
    orderService,
    cartService
  );

  const router = express.Router();

  router.use(currentUser, requireAuth, isCustomer);
  router.post(
    "/payments",
    paymentController.createPayment.bind(paymentController)
  );
  return router;
}

export { paymentRoutes };
