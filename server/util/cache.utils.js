const cachingIsEnabled = (process.env.NODE_ENV === 'production' || process.env.FORCE_CACHING === "true");

export const probeForCache = async (req) => {
    if(cachingIsEnabled) {
        let cacheFound = await _fetchCache(req);
        if(!!cacheFound) {
            return await _setCacheArtifacts(cacheFound);
        }
    }
    return false;
}
export const cacheResults = async (req, dataToCache, expires = 1) => {
    if(cachingIsEnabled) {
        await req.app.redisClient.set(req.originalUrl, JSON.stringify(dataToCache), "EX", 120);
    }
    return req;
}

const _fetchCache = async (req) => await req.app.redisClient.get(`${req.originalUrl}`);
const _setCacheArtifacts = async (cache) => {
    return {
        data: !!cache ? JSON.parse(cache) : null,
        fromCache: !!cache
    }
}