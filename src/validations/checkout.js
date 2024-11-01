"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const createCheckoutValidation = joi_1.default.object({
    orderId: joi_1.default.string().required(),
});
exports.createCheckoutValidation = createCheckoutValidation;
