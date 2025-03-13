import { createClient } from 'redis';

export const redisClient = (() => {
    const redisClient = createClient(
        {
            url: process.env.REDIS_EXTERNAL_URL,
            pingInterval: 4 * 60 * 1000,
            socket: {
                tls: false
            }
        }
    );

    redisClient.on('error', (err) => {
        console.error('Redis Client Error: ', err);
        return null;
    });

    try {
        return redisClient.connect();
    } catch (e) {
        console.error('Redis Client Error: ', e);
        return null;
    }
})();

export const gracefulShutdownRedis = (redisClient) => redisClient.close();
