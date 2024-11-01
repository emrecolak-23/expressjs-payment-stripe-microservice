import express from "express";

export const routes = express.Router();

import { paymentRoutes } from "./payment.route";
import { orderRoutes } from "./order.route";
import { cartRoutes } from "./cart.route";
import { checkoutRoutes } from "./checkout.route";
import { portalRotues } from "./portal.route";
import { couponRoutes } from "./coupon.route";

routes.use("/inmidi-payments", paymentRoutes());
routes.use("/inmidi-order", orderRoutes());
routes.use("/inmidi-cart", cartRoutes());
routes.use("/checkout", checkoutRoutes());
routes.use("/inmidi-portal", portalRotues());
routes.use("/inmidi-coupon", couponRoutes());
