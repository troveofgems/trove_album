import * as redis from "redis";
import {EventEmitter} from "events";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_DELAY_MS = 1000;
const DEFAULT_BACKOFF_FACTOR = 2;

export class RedisService extends EventEmitter {
    constructor(options = {}) {
        super();

        this.retryOptions = {
            maxRetries: options.maxRetries || DEFAULT_MAX_RETRIES,
            delayMs: options.delayMs || DEFAULT_DELAY_MS,
            backoffFactor: options.backoffFactor || DEFAULT_BACKOFF_FACTOR
        };

        this.client = redis.createClient({
            url: process.env.REDIS_EXTERNAL_URL,
            pingInterval: 4 * 60 * 1000,
            socket: {
                tls: false
            }
        });

        this.retryOperation = async function retryOperation(operation, retryCount = 0) {
            try {
                return await operation();
            } catch (error) {
                if (retryCount >= this.retryOptions.maxRetries) {
                    throw error;
                }

                const delay = this.retryOptions.delayMs * Math.pow(this.retryOptions.backoffFactor, retryCount);

                await new Promise(resolve => setTimeout(resolve, delay));

                return this.retryOperation(operation, retryCount + 1);
            }
        }

        this.connectionListeners = new Set();

        // Handle connection events
        this.client.on('connect', () => {
            this.isConnected = true;
            this.emit('connected');
            this.notifyConnectionStatus(true);
        });

        this.client.on('error', (err) => {
            this.isConnected = false;
            this.emit('error', err);
            this.notifyConnectionStatus(false);
        });

        this.client.on('end', () => {
            this.isConnected = false;
            this.emit('disconnected');
            this.notifyConnectionStatus(false);
        });

        this.client.on('reconnecting', () => {
            this.emit('reconnecting');
        });
    }

    isConnected = false;

    getClient() {
        return this.client;
    }

    async openConnection(app) {
        await this.retryOperation(async () => {
            if (this.isConnected) {
                return;
            }

            const startTime = Date.now();
            app.redisClient = await this.client.connect();

            console.log("========== REDIS Caching Server============", "\n", `Redis connection established in ${Date.now() - startTime}ms`);
            this.onConnectionChange(this.isConnected);
            return app;
        });
    }

    async closeConnection() {
        return this.client.disconnect();
    }

    fetchConnectionStatus() {
        return this.isConnected;
    }

    notifyConnectionStatus(connected) {
        this.connectionListeners.forEach(listener => listener(connected));
    }

    onConnectionChange() {
        let callback = (connected) => {
            console.log(` Redis connection status changed: ${connected ? 'Connected' : 'Disconnected'}`);
            if (!connected) { // Handle reconnection attempts
                console.log('Redis Connection Not Detected...Attempting to reconnect...');
                redisServiceInstance.openConnection()
                    .catch(error => console.error('Failed to reconnect:', error));
            }
        }

        this.connectionListeners.add(callback);
        const currentStatus = this.isConnected;

        callback(currentStatus);

        return () => {
            this.connectionListeners.delete(callback);
        };
    }
}

export const redisServiceInstance = new RedisService();

process.on('SIGINT', () => {
    redisServiceInstance.closeConnection().then(() => console.log("Redis Connection Closed..."));
    process.exit();
});
