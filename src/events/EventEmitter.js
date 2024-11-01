"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEventEmitter = void 0;
const events_1 = require("events");
class CustomEventEmitter extends events_1.EventEmitter {
    static getInstance() {
        if (!this.instance) {
            this.instance = new events_1.EventEmitter();
        }
        return this.instance;
    }
}
exports.CustomEventEmitter = CustomEventEmitter;
