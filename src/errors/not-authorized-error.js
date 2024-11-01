"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAuthorizedError = void 0;
const custom_error_1 = require("./custom-error");
class NotAuthorizedError extends custom_error_1.CustomError {
    constructor(message) {
        super(message !== null && message !== void 0 ? message : 'Not authorized');
        this.statusCode = 401;
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
    serializeErrors() {
        var _a;
        return [{ message: (_a = this.message) !== null && _a !== void 0 ? _a : 'Not authorized' }];
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
