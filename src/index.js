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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channel = exports.rabbitMqConn = exports.consulInstance = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const EventEmitter_1 = require("./events/EventEmitter");
const app_1 = require("./app");
const config_1 = require("./config");
const company_listener_1 = require("./events/listeners/company-listener/company.listener");
const models_1 = require("./models");
let rabbitMqConn;
let consulInstance;
let channel;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield mongoose_1.default.connect(MONGO_URI, {
            dbName: "Payments",
        });
        console.log("Connected to MongoDB");
        mongoose_1.default.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
            // Connection disconnected status handling
            mongoose_1.default.connect(MONGO_URI, { dbName: "InmidiPackages" });
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.log("MongoDB connection disconnected");
            // Connection disconnected status handling
            mongoose_1.default.connect(MONGO_URI, { dbName: "InmidiPackages" });
        });
        const consulHost = process.env.CONSUL_URI;
        const consulService = process.env.CONSUL_SERVICE;
        exports.consulInstance = consulInstance = new config_1.ConsulInstance(consulService, consulHost);
        yield consulInstance.registerService();
        const rabbitMQUri = process.env.AMQP_URI;
        exports.rabbitMqConn = rabbitMqConn = yield config_1.rabbitMQ.connect(rabbitMQUri);
        exports.channel = channel = config_1.rabbitMQ.getChannel();
        const eventEmitter = EventEmitter_1.CustomEventEmitter.getInstance();
        const companyListener = company_listener_1.CompanyListener.getInstance(channel, eventEmitter);
        companyListener.subscribe();
        const handleProcessTermination = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield consulInstance.deregisterService();
                yield rabbitMqConn.close();
                process.exit(0);
            }
            catch (err) {
                console.error(`Error during termination: ${err}`);
                process.exit(1);
            }
        });
        node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Cron job started");
            const currentDate = new Date();
            const orders = yield models_1.Order.find({
                status: "pending",
                expiresAt: { $lt: currentDate },
            });
            for (let order of orders) {
                order.status = "expired";
                yield order.save();
            }
        }));
        process.on("SIGINT", handleProcessTermination); // Handles Ctrl+C
        process.on("SIGTERM", handleProcessTermination); // Handles external termination
        process.on("beforeExit", handleProcessTermination); // Handles unhandled exceptions
        const PORT = process.env.PORT;
        app_1.app.listen(PORT, () => {
            console.log("Server listening at: ", PORT);
        });
    }
    catch (error) {
        throw new Error(error.message);
    }
});
start();
