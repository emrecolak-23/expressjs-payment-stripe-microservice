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
exports.Listener = void 0;
const exception_handler_publisher_1 = require("../publishers/exception-handler.publisher");
const uuid_1 = require("uuid");
const subjects_1 = require("./subjects");
class Listener {
    constructor(channel, emitter) {
        this.channel = channel;
        this.emitter = emitter;
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.assertQueue(this.queueName, { durable: true });
            this.channel.consume(this.queueName, (msg) => {
                if (msg) {
                    const message = this.parseMessage(msg);
                    if (!(message.type in subjects_1.Subjects)) {
                        this.channel.nack(msg, false, false);
                        return;
                    }
                    this.emitter.emit(message.type, message.body, msg);
                }
            });
        });
    }
    parseMessage(msg) {
        const message = JSON.parse(msg.content.toString("utf8"));
        return message;
    }
    isValidEventData(value, schema, msg) {
        if (!value) {
            const errorMessage = {
                messageId: (0, uuid_1.v4)(),
                type: "QUEUE_NOT_READ_EXCEPTION",
                body: {
                    destination: process.env.CONSUL_SERVICE,
                    exception: "Missing event data",
                    body: JSON.stringify(value),
                },
                source: process.env.CONSUL_SERVICE,
            };
            new exception_handler_publisher_1.ExceptionHandlerPublisher(this.channel).publish(errorMessage);
            return false;
        }
        const requiredFields = schema.required;
        const errorFields = [];
        const isDataValid = requiredFields.every((field) => {
            const isFieldValidType = typeof value[field] === schema.properties[field].type;
            const isFieldValidExist = requiredFields.includes(field);
            if (!isFieldValidType || !isFieldValidExist) {
                const errorMessage = field.toString();
                errorFields.push(errorMessage);
            }
            return isFieldValidType && isFieldValidExist;
        });
        if (!isDataValid) {
            const combinedErrorMessage = `Invalid type or missing data for fields ${errorFields.join(",")} in event data`;
            const errorMessage = {
                messageId: (0, uuid_1.v4)(),
                type: "QUEUE_NOT_READ_EXCEPTION",
                body: {
                    destination: process.env.CONSUL_SERVICE,
                    exception: combinedErrorMessage,
                    body: JSON.stringify(msg),
                },
                source: process.env.CONSUL_SERVICE,
            };
            new exception_handler_publisher_1.ExceptionHandlerPublisher(this.channel).publish(errorMessage);
        }
        return isDataValid;
    }
    handleErrors(type, msg, error) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(error);
            this.channel.nack(msg, false, false);
            new exception_handler_publisher_1.ExceptionHandlerPublisher(this.channel).publish({
                messageId: (0, uuid_1.v4)(),
                body: {
                    type,
                    destination: process.env.CONSUL_SERVICE,
                    exception: error.message,
                    body: JSON.stringify(msg),
                },
                source: "exception-handler-service",
            });
        });
    }
}
exports.Listener = Listener;
