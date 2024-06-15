import amqplib from "amqplib";

class Amqblib {
  private _connection?: amqplib.Connection;
  private _channel?: amqplib.Channel;

  get connection() {
    if (!this._connection) {
      throw new Error("Cannot access Rabbit Mq channel before connecting");
    }

    return this._connection;
  }

  getChannel() {
    return this._channel;
  }

  async connect(url: string) {
    try {
      this._connection = await amqplib.connect(url);
      this._channel = await this._connection.createChannel();
      console.log("RabbitMQ connection established");
      this._connection.on("close", () => {
        this.reconnect();
      });
      return this._connection;
    } catch (err) {
      throw new Error("Connection to RabbitMQ failed");
    }
  }

  async reconnect() {
    console.log("Attempting to reconnect to RabbitMQ...");
    try {
      this._connection = await amqplib.connect(process.env.AMQP_URI!);
      this._channel = await this._connection.createChannel();
      console.log("RabbitMQ connection re-established");
    } catch (err) {
      console.error("RabbitMQ reconnection failed", err);
      console.log("Retrying reconnection in 5 seconds...");
      setTimeout(() => {
        this.reconnect();
      }, 5000);
    }
  }

  async close() {
    if (this._channel) {
      await this._channel.close();
    }
    if (this._connection) {
      await this._connection.close();
    }
  }

  public async checkRabbitMqConnection() {
    const connection = await amqplib.connect(process.env.AMQP_URI!);
    const channel = await connection.createChannel();
    await channel.assertQueue("test", { durable: true });
    await channel.close();
    await connection.close();
  }
}

export const rabbitMQ = new Amqblib();
export { Connection } from "amqplib";
