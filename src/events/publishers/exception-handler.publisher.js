"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionHandlerPublisher = void 0;
const base_publisher_1 = require("./base.publisher");
class ExceptionHandlerPublisher extends base_publisher_1.Publisher {
    constructor(channel) {
        super(channel, ["exception-handler-service"]);
    }
}
exports.ExceptionHandlerPublisher = ExceptionHandlerPublisher;
