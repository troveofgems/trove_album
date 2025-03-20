import Redis from "ioredis";

export const setRedisClientForApplication = app => {
    let client = new Redis(process.env.REDIS_EXTERNAL_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 7,
        maxLoadingRetryTimeout: 5000,
        connectionName: "redis-tog-photo-album",
        retryStrategy: (times) => {
            // Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ...
            const fibonacci = [0, 1, 1, 2, 3, 5, 8];
            return fibonacci[times] * 1000;
        },
        reconnectOnError: (err) => {
            const targetError = "READONLY";
            if (err.message.includes(targetError)) {
                // Only reconnect when the error contains "READONLY"
                return true; // or `return 1;`
            }
        }
    });

    if(!!client && client.status === "wait" && process.env.NODE_ENV === "development") {
        console.log("=> REDIS CACHING SERVER");
        console.log("Redis Client Attached & Awaiting Connections...\n");
    }

    return app.redisClient = client;
}

export const removeRedisClientFromApplication = app => app.redisClient = null;