"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const not_found_error_1 = require("../errors/not-found-error");
class PortalController {
    static getInstance(companiesService) {
        if (!this.instance) {
            this.instance = new PortalController(companiesService);
        }
        return this.instance;
    }
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    createCustomerPortal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const stripeApi = new stripe_1.default(process.env.STRIPE_RESTRICTED_KEY);
            const { id: customerId } = req.currentUser;
            const customer = yield this.companiesService.findCompanyId(customerId);
            const { authorizedPersonEmail } = customer;
            const stripeCustomer = yield stripeApi.customers.list({
                email: authorizedPersonEmail,
                limit: 1,
            });
            console.log(stripeCustomer, "stripeCustomer");
            if (!stripeCustomer.data.length) {
                throw new not_found_error_1.NotFoundError(i18n.__("customer_not_found"));
            }
            const customerPortal = yield stripeApi.billingPortal.sessions.create({
                customer: stripeCustomer.data[0].id,
                return_url: process.env.WEB_APP_URL,
            });
            res.status(200).json({ url: customerPortal.url });
        });
    }
}
exports.PortalController = PortalController;
