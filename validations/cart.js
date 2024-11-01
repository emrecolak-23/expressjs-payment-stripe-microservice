"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartValidation = exports.addToCartValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const addToCartValidation = joi_1.default.object({
    packageGroupId: joi_1.default.string().required(),
    numberOfSeats: joi_1.default.number(),
    durationType: joi_1.default.number().equal(1),
});
exports.addToCartValidation = addToCartValidation;
const updateCartValidation = joi_1.default.object({
    numberOfSeats: joi_1.default.number().required(),
});
exports.updateCartValidation = updateCartValidation;
