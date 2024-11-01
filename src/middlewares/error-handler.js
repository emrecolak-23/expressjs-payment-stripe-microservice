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
exports.errorHandler = void 0;
const custom_error_1 = require("../errors/custom-error");
const error_response_1 = __importDefault(require("../responses/error-response"));
const errorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (res.headersSent) {
        return next(err); // Pass the error to the default Express error handler
    }
    if (err instanceof custom_error_1.CustomError) {
        res
            .status(err.statusCode)
            .json(new error_response_1.default("custom error", err.serializeErrors()));
    }
    else {
        res
            .status(400)
            .json(new error_response_1.default("Something went wrong", [{ message: err.message }]));
    }
});
exports.errorHandler = errorHandler;
