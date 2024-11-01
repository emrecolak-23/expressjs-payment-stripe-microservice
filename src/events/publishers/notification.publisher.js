"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventNotificationPublisher = void 0;
const base_publisher_1 = require("./base.publisher");
class EventNotificationPublisher extends base_publisher_1.Publisher {
    constructor(channel) {
        super(channel, ["event-notification-service"]);
    }
}
exports.EventNotificationPublisher = EventNotificationPublisher;
