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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
class Publisher {
    constructor(channel, rabbitMqQueueNames) {
        this.rabbitMqQueueNames = rabbitMqQueueNames;
        this.channel = channel;
    }
    publish(data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const queueName of this.rabbitMqQueueNames) {
                this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
                console.log(`[x] Sent ${JSON.stringify(data)} to ${queueName}`);
            }
        });
    }
}
exports.Publisher = Publisher;
