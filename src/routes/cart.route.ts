import express, { Router } from "express";
import { CartController } from "../controllers";
import {
  CartService,
  SubscriptionPackageService,
  CouponUsageService,
} from "../services";
import { currentUser, requireAuth } from "../middlewares";
import { isCustomer } from "../guards";
import { validate } from "../middlewares";
import { addToCartValidation, updateCartValidation } from "../validations/cart";

function cartRoutes(): Router {
  const cartService = CartService.getInstance();
  const subscriptionPackageService = SubscriptionPackageService.getInstance();
  const couponUsageService = CouponUsageService.getInstance();
  const cartController = CartController.getInstance(
    cartService,
    subscriptionPackageService,
    couponUsageService
  );

  const router = express.Router();
  router.use(currentUser, requireAuth, isCustomer);
  router.post(
    "/cart",
    validate(addToCartValidation),
    cartController.addToCart.bind(cartController)
  );
  router.get("/cart", cartController.getCart.bind(cartController));
  router.delete("/cart", cartController.deleteCart.bind(cartController));
  router.patch(
    "/cart/:packageGroupId",
    validate(updateCartValidation),
    cartController.updateCartItem.bind(cartController)
  );
  router.delete(
    "/cart/:packageGroupId",
    cartController.deleteCartItem.bind(cartController)
  );
  router.get(
    "/cart-items-number",
    cartController.getCartItemsNumber.bind(cartController)
  );
  return router;
}

export { cartRoutes };
