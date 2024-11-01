"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SuccessResponse {
    constructor(data, message) {
        this.message = message;
        this.data = data;
    }
    toJSON() {
        return {
            message: this.message,
            data: this.data,
        };
    }
}
exports.default = SuccessResponse;
