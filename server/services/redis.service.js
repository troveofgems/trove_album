import { createClient } from 'redis';

export const redisClient = (() => {
    const redisClient = createClient(
        {
            url: process.env.REDIS_EXTERNAL_URL
        }
    );

    redisClient.on('error', (err) => {
        console.error('Redis Client Error: ', err);
        process.exit(1);
    });

    return redisClient.connect();
})();
