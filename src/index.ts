import mongoose from "mongoose";
import cron from "node-cron";
import { CustomEventEmitter } from "./events/EventEmitter";
import { app } from "./app";
import { Connection, rabbitMQ, ConsulInstance } from "./config";
import { CompanyListener } from "./events/listeners/company-listener/company.listener";
import { Order } from "./models";

let rabbitMqConn: Connection;
let consulInstance: any;
let channel: any;

const start = async () => {
  if (!process.env.PORT) {
    throw new Error("PORT must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV must be defined");
  }

  if (!process.env.CONSUL_URI) {
    throw new Error("CONSUL_URI must be defined");
  }

  if (!process.env.CONSUL_SERVICE) {
    throw new Error("CONSUL_SERVICE must be defined");
  }

  if (!process.env.AMQP_URI) {
    throw new Error("AMQP_URI must be defined");
  }

  try {
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI!, {
      dbName: "Payments",
    });
    console.log("Connected to MongoDB");

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      // Connection disconnected status handling
      mongoose.connect(MONGO_URI!, { dbName: "InmidiPackages" });
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB connection disconnected");
      // Connection disconnected status handling
      mongoose.connect(MONGO_URI!, { dbName: "InmidiPackages" });
    });

    const consulHost = process.env.CONSUL_URI;
    const consulService = process.env.CONSUL_SERVICE;
    consulInstance = new ConsulInstance(consulService, consulHost);
    await consulInstance.registerService();

    const rabbitMQUri = process.env.AMQP_URI;
    rabbitMqConn = await rabbitMQ.connect(rabbitMQUri);
    channel = rabbitMQ.getChannel();
    const eventEmitter = CustomEventEmitter.getInstance();
    const companyListener = CompanyListener.getInstance(channel, eventEmitter);
    companyListener.subscribe();
    const handleProcessTermination = async () => {
      try {
        await consulInstance.deregisterService();
        await rabbitMqConn.close();
        process.exit(0);
      } catch (err) {
        console.error(`Error during termination: ${err}`);
        process.exit(1);
      }
    };

    cron.schedule("0 0 * * *", async () => {
      console.log("Cron job started");
      const currentDate = new Date();
      const orders = await Order.find({
        status: "pending",
        expiresAt: { $lt: currentDate },
      });
      for (let order of orders) {
        order.status = "expired";
        await order.save();
      }
    });

    process.on("SIGINT", handleProcessTermination); // Handles Ctrl+C
    process.on("SIGTERM", handleProcessTermination); // Handles external termination
    process.on("beforeExit", handleProcessTermination); // Handles unhandled exceptions

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log("Server listening at: ", PORT);
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

start();

export { consulInstance, rabbitMqConn, channel };
