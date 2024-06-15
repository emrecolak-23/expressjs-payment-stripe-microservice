import * as amqp from 'amqplib';

export interface Event {
    messageId: string;
    type: string;
    data: {
        [key: string]: any;
    }
}

export abstract class Publisher<T extends Event> {
    private rabbitMqQueueNames: string[];
    private channel: amqp.Channel;

    constructor(channel: amqp.Channel, rabbitMqQueueNames: string[]) {
        this.rabbitMqQueueNames = rabbitMqQueueNames;
        this.channel = channel;
    }

    async publish(data: T['data']): Promise<void> {
        for (const queueName of this.rabbitMqQueueNames) {
            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
            console.log(`[x] Sent ${JSON.stringify(data)} to ${queueName}`);
        }
    }
}
