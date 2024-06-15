import { Publisher, Event } from "./base.publisher";

export class PaymentsCreatedPublisher extends Publisher<Event> {
    constructor(channel: any, queueName: [string]) {
        super(channel, queueName);
    }

}