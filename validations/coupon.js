"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoupon = void 0;
const joi_1 = __importDefault(require("joi"));
const createCoupon = joi_1.default.object({
    authorizationName: joi_1.default.string().length(4).required(),
    discount: joi_1.default.number().required(),
    expirationDate: joi_1.default.date().required(),
    isSubs: joi_1.default.boolean().required(),
    trialDuration: joi_1.default.number().optional(),
    isOnlyForOneCompany: joi_1.default.boolean().required(),
});
exports.createCoupon = createCoupon;
