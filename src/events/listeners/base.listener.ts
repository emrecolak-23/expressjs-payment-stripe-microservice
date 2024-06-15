import amqp, { Channel, ConsumeMessage } from "amqplib";
import { ExceptionHandlerPublisher } from "../publishers/exception-handler.publisher";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter } from "events";
import { Subjects } from "./subjects";

type ValidationSchema = {
  type: Object;
  properties: Record<string, { type: string }>;
  required: string[];
  additionalProperties: boolean;
};
export abstract class Listener<T = any> {
  abstract queueName: string;
  abstract onMessage(data: T, type: string, msg: amqp.ConsumeMessage): void;
  channel: Channel;
  emitter: EventEmitter;
  constructor(channel: Channel, emitter: EventEmitter) {
    this.channel = channel;
    this.emitter = emitter;
  }

  async subscribe(): Promise<void> {
    await this.channel.assertQueue(this.queueName, { durable: true });
    this.channel.consume(this.queueName, (msg) => {
      if (msg) {
        const message = this.parseMessage(msg);
        if (!(message.type in Subjects)) {
          this.channel.nack(msg, false, false);
          return;
        }
        this.onMessage(message.body, message.type, msg);
        this.emitter.emit(message.type, message.body, msg);
      }
    });
  }

  parseMessage(msg: amqp.ConsumeMessage) {
    const message = JSON.parse(msg.content.toString("utf8"));
    return message;
  }

  isValidEventData(
    value: any,
    schema: ValidationSchema,
    msg: amqp.ConsumeMessage
  ) {
    if (!value) {
      const errorMessage = {
        messageId: uuidv4(),
        type: "QUEUE_NOT_READ_EXCEPTION",
        body: {
          destination: process.env.CONSUL_SERVICE,
          exception: "Missing event data",
          body: JSON.stringify(value),
        },
        source: process.env.CONSUL_SERVICE,
      };

      new ExceptionHandlerPublisher(this.channel).publish(errorMessage);
      return false;
    }

    const requiredFields = schema.required;
    const errorFields: Array<string> = [];

    const isDataValid = requiredFields.every((field) => {
      const isFieldValidType =
        typeof value[field] === schema.properties[field].type;
      const isFieldValidExist = requiredFields.includes(field);
      if (!isFieldValidType || !isFieldValidExist) {
        const errorMessage = field.toString();
        errorFields.push(errorMessage);
      }

      return isFieldValidType && isFieldValidExist;
    });

    if (!isDataValid) {
      const combinedErrorMessage = `Invalid type or missing data for fields ${errorFields.join(
        ","
      )} in event data`;

      const errorMessage = {
        messageId: uuidv4(),
        type: "QUEUE_NOT_READ_EXCEPTION",
        body: {
          destination: process.env.CONSUL_SERVICE,
          exception: combinedErrorMessage,
          body: JSON.stringify(msg),
        },
        source: process.env.CONSUL_SERVICE,
      };

      new ExceptionHandlerPublisher(this.channel).publish(errorMessage);
    }

    return isDataValid;
  }

  async handleErrors(type: string, msg: ConsumeMessage, error: Error) {
    console.error(error);
    this.channel!.nack(msg, false, false);
    new ExceptionHandlerPublisher(this.channel).publish({
      messageId: uuidv4(),
      body: {
        type,
        destination: process.env.CONSUL_SERVICE,
        exception: error.message,
        body: JSON.stringify(msg),
      },
      source: "exception-handler-service",
    });
  }
}
