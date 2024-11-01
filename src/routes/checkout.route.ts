import express, { Router } from "express";
import {
  PaymentService,
  OrderService,
  CompanyService,
  CartService,
  SubscriptionPackageService,
  CouponService,
  CouponUsageService,
} from "../services";

import { currentUser, requireAuth } from "../middlewares";
import { isCustomer } from "../guards";
import { CheckoutController } from "../controllers/checkout.controller";
import { validate } from "../middlewares";
import { createCheckoutValidation } from "../validations/checkout";

function checkoutRoutes(): Router {
  const paymentService = PaymentService.getInstance();
  const orderService = OrderService.getInstance();
  const companyService = CompanyService.getInstance();
  const cartService = CartService.getInstance();
  const packagesService = SubscriptionPackageService.getInstance();
  const couponService = CouponService.getInstance();
  const couponUsageService = CouponUsageService.getInstance();
  const checkoutController = new CheckoutController(
    orderService,
    paymentService,
    companyService,
    cartService,
    packagesService,
    couponService,
    couponUsageService
  );

  const router = express.Router();
  router.post(
    "/webhook",
    checkoutController.checkOutWebhook.bind(checkoutController)
  );
  router.post(
    "/create",
    currentUser,
    requireAuth,
    isCustomer,
    validate(createCheckoutValidation),
    checkoutController.createCheckoutSession.bind(checkoutController)
  );

  return router;
}

export { checkoutRoutes };
