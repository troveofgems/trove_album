import * as redis from "redis";

export class RedisService {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_EXTERNAL_URL,
            pingInterval: 4 * 60 * 1000,
            socket: {
                tls: false
            }
        });
    }

    async openConnection() {
        return this.client.connect();
    }

    async closeConnection() {
        return this.client.disconnect();
    }
}

export const redisServiceInstance = new RedisService();

export const attachRedisClientToApp = async (app) => {
    if(process.env.NODE_ENV !== "production") {
        console.log("Redis Client Attached...");
    }
    app.redisClient = await redisServiceInstance.openConnection();
    return app;
}