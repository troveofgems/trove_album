import {redisClient} from "../services/redis.service.js";

export const cacheMiddleware = async (req, res, next) => {
    req.redisClient = await redisClient;
    next();
}

export const invalidateCache = (req, cacheKey) => {
    req.redisClient.del(cacheKey, (err, response) => {
       if(err) throw err;
       console.log(`CacheKey ${cacheKey} deleted`);
    });
}