"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const createOrderValidation = joi_1.default.object({
    cartId: joi_1.default.string(),
    packages: joi_1.default.array().items(),
});
exports.createOrderValidation = createOrderValidation;
