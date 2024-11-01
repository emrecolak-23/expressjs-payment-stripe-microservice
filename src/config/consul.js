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
exports.ConsulInstance = void 0;
const consul_1 = __importDefault(require("consul"));
const crypto_1 = require("crypto");
const os_1 = __importDefault(require("os"));
class ConsulInstance {
    constructor(service, uri) {
        const consulHost = process.env.NODE_ENV === "production" ? uri : "localhost";
        this.consulClient = new consul_1.default({ host: consulHost });
        const uniqueInstanceId = (0, crypto_1.randomBytes)(16).toString("hex");
        let address = this.getEth0IPAddress();
        let healthCheckUrl = "http://localhost:3001/payments-inmidi/healthcheck";
        if (process.env.NODE_ENV === "production") {
            healthCheckUrl = `http://${address}:3000/payments-inmidi/healthcheck`;
        }
        this.consulService = {
            name: service,
            id: `${service}-${uniqueInstanceId}`,
            address: address,
            port: 3000,
            check: {
                http: healthCheckUrl,
                interval: "30s",
                timeout: "5s",
                deregistercriticalserviceafter: "1m",
            }
        };
    }
    getEth0IPAddress() {
        const networkInterfaces = os_1.default.networkInterfaces();
        const eth0 = networkInterfaces['eth0'];
        if (eth0) {
            for (let network of eth0) {
                if (network.family === 'IPv4' && !network.internal) {
                    return network.address;
                }
            }
        }
        return 'localhost';
    }
    registerService() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consulClient.agent.service.register(this.consulService);
                console.log("Service registered to Consul");
            }
            catch (error) {
                throw new Error("Failed to register service with Consul");
            }
        });
    }
    deregisterService() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consulClient.agent.service.deregister(this.consulService.id);
                console.log("Service deregistered from Consul");
            }
            catch (error) {
                console.error("Failed to deregister service from Consul", error);
            }
        });
    }
    getConsulClient() {
        return this.consulClient;
    }
    getConsulService() {
        return this.consulService;
    }
}
exports.ConsulInstance = ConsulInstance;
