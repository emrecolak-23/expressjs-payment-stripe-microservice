"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorResponse extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        this.message = message;
    }
    toJSON() {
        return {
            data: {
                errors: this.data
            }
        };
    }
}
exports.default = ErrorResponse;
