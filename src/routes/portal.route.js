"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRotues = void 0;
const express_1 = __importDefault(require("express"));
const portal_controller_1 = require("../controllers/portal.controller");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const guards_1 = require("../guards");
function portalRotues() {
    const router = express_1.default.Router();
    const companyService = services_1.CompanyService.getInstance();
    const paymentController = portal_controller_1.PortalController.getInstance(companyService);
    router.use(middlewares_1.currentUser, middlewares_1.requireAuth, guards_1.isCustomer);
    router.get("/", paymentController.createCustomerPortal.bind(paymentController));
    return router;
}
exports.portalRotues = portalRotues;
