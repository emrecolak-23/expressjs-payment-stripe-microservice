"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const custom_error_1 = require("./custom-error");
class InternalServerError extends custom_error_1.CustomError {
    constructor(message) {
        super(message !== null && message !== void 0 ? message : "Internal server error");
        this.statusCode = 500;
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
    serializeErrors() {
        var _a;
        return [{ message: (_a = this.message) !== null && _a !== void 0 ? _a : "Internal server error" }];
    }
}
exports.InternalServerError = InternalServerError;
