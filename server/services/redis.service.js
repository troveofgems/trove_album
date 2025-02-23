import { createClient } from 'redis';

export const redisClient = (() => {
    const redisClient = createClient(
        {
            url: process.env.REDIS_EXTERNAL_URL,
            pingInterval: 4 * 60 * 1000,

        }
    );

    redisClient.on('error', (err) => {
        console.error('Redis Client Error: ', err);
        return process.exit(1);
    });

    return redisClient.connect();
})();

export const gracefulShutdownRedis = (redisClient) => redisClient.close();
