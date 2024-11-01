"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequstValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequstValidationError extends custom_error_1.CustomError {
    constructor(errors) {
        super('Invalid request parameter');
        this.errors = errors;
        this.statusCode = 400;
        Object.setPrototypeOf(this, RequstValidationError.prototype);
    }
    serializeErrors() {
        return this.errors.map(err => {
            return { message: err.message };
        });
    }
}
exports.RequstValidationError = RequstValidationError;
