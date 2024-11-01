"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
class StripeService {
    constructor() {
        this._stripe = new stripe_1.default(process.env.STRIPE_RESTRICTED_KEY);
    }
    static getInstance() {
        if (!StripeService._instance) {
            StripeService._instance = new StripeService();
        }
        return StripeService._instance;
    }
    get stripeApi() {
        return this._stripe;
    }
}
exports.default = StripeService;
