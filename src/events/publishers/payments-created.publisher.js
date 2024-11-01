"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsCreatedPublisher = void 0;
const base_publisher_1 = require("./base.publisher");
class PaymentsCreatedPublisher extends base_publisher_1.Publisher {
    constructor(channel, queueName) {
        super(channel, queueName);
    }
}
exports.PaymentsCreatedPublisher = PaymentsCreatedPublisher;
