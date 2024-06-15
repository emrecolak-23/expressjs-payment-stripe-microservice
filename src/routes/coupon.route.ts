import { Router } from "express";
import { CouponController } from "../controllers";
import {
  CouponService,
  CouponUsageService,
  CartService,
  OrderService,
} from "../services";
import { currentUser, requireAuth } from "../middlewares";
import { isAdmin } from "../guards";

export function couponRoutes(): Router {
  const couponService = CouponService.getInstance();
  const couponUsageService = CouponUsageService.getInstance();
  const cartService = CartService.getInstance();
  const orderService = OrderService.getInstance();
  const couponController = CouponController.getInstance(
    couponService,
    couponUsageService,
    cartService,
    orderService
  );

  const router = Router();

  router.use(currentUser, requireAuth);
  router.post("/use-coupon", couponController.useCoupon.bind(couponController));
  router.post(
    "/cancel-coupon",
    couponController.cancelCouponUsage.bind(couponController)
  );

  router.post(
    "/coupon",
    couponController.getCurrentCartCoupon.bind(couponController)
  );
  router.use(isAdmin);
  router.post("/", couponController.createCoupon.bind(couponController));
  router.post(
    "/coupon-code-usage",
    couponController.couponCodeUsage.bind(couponController)
  );

  router.post("/all", couponController.getAllCoupon.bind(couponController));
  router.get("/:id", couponController.getCouponById.bind(couponController));
  router.post(
    "/deactivate",
    couponController.deactivateCoupon.bind(couponController)
  );
  router.post(
    "/coupon-price-insights",
    couponController.couponCodePriceInsights.bind(couponController)
  );
  return router;
}
