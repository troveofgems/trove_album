import { createClient } from 'redis';

export const connectToRedis = () => {
    const redisClient = createClient(
        {
            url: process.env.REDIS_EXTERNAL_URL
        }
    );

    redisClient.on('error', (err) => {
        console.error('Redis Client Error: ', err);
        process.exit(1);
    });

    return redisClient
        .connect()
        .then(async (client) => {
            await client.set('key', 'node redis');
            const value = await client.get('key');

            console.log("Found value: ", value);
            return client;
        })
        .catch(err => {
            console.error('Redis Client Error: ', err);
            return process.exit(1);
        });
}
