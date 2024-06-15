import express, { Router } from "express";
import { PortalController } from "../controllers/portal.controller";
import { CompanyService } from "../services";

import { currentUser, requireAuth } from "../middlewares";
import { isCustomer } from "../guards";
function portalRotues(): Router {
  const router = express.Router();

  const companyService = CompanyService.getInstance();
  const paymentController = PortalController.getInstance(companyService);

  router.use(currentUser, requireAuth, isCustomer);
  router.get(
    "/",
    paymentController.createCustomerPortal.bind(paymentController)
  );

  return router;
}

export { portalRotues };
