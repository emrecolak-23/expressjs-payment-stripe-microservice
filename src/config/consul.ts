import Consul from "consul";
import { randomBytes } from "crypto";
import os from "os"

class ConsulInstance {
    private consulClient: any;
    private consulService: { name: string; id: string, address: string, port: number, check: any };

    constructor(service: string, uri: string) {
        const consulHost =
            process.env.NODE_ENV === "production" ? uri : "localhost";

        this.consulClient = new Consul({ host: consulHost });

        const uniqueInstanceId = randomBytes(16).toString("hex");

        let address = this.getEth0IPAddress();

        let healthCheckUrl = "http://localhost:3001/payments-inmidi/healthcheck";
        if (process.env.NODE_ENV === "production") {
            healthCheckUrl = `http://${address}:3000/payments-inmidi/healthcheck`
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

    private getEth0IPAddress(): string {
        const networkInterfaces = os.networkInterfaces();
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

    async registerService() {
        try {
            await this.consulClient.agent.service.register(this.consulService);
            console.log("Service registered to Consul");
        } catch (error) {
            throw new Error("Failed to register service with Consul");
        }
    }

    async deregisterService() {
        try {
            await this.consulClient.agent.service.deregister(this.consulService.id);
            console.log("Service deregistered from Consul");
        } catch (error) {
            console.error("Failed to deregister service from Consul", error);
        }
    }

    getConsulClient(): any {
        return this.consulClient;
    }

    getConsulService(): { name: string; id: string } {
        return this.consulService;
    }
}

export { ConsulInstance }