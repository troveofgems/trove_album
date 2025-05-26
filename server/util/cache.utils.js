const cachingIsEnabled = (process.env.NODE_ENV === 'production' || process.env.FORCE_CACHING === "true");

// File Exports
export const probeForCache = async (req) => {
    const
        uiFS = JSON.parse(req.query.uiFetchSettings),
        viewEnum = getViewEnum(uiFS),
        authEnum = getAuthEnum(req.user),
        userEnum = getUserEnum(req.user),
        constructedCacheKey = `app:alb:gly:${viewEnum}:${authEnum}:${userEnum}:${uiFS.page}`;

    if(cachingIsEnabled) {
        let cacheFound = await _fetchCache(req, constructedCacheKey);
        console.log("CacheFound", cacheFound);
        return {
            cacheFound: true,
            data: JSON.parse(cacheFound),
            cacheKey: constructedCacheKey
        }
    }

    return {
        cacheFound: false,
        cacheKey: constructedCacheKey
    };
};
export const cacheResults = async (req, dataToCache, expires = 1, cacheKey) => {
    if(cachingIsEnabled) {
        console.log("Setting Cache...?", dataToCache)
        await req.app.redisClient.set(cacheKey, JSON.stringify(dataToCache));
    }
    return req;
};
export const deleteCache = (req, cacheKey) => {
    return req.app.redisClient.del(cacheKey);
};

// Internal Helper Functions
const getViewEnum = (viewEnum) => {
    let value = null;

    switch(viewEnum.settings.filters.category) {
        case "*":
            value = "ai";
            break;
        case "Family & Friends":
            value = "faf";
            break;
        case "Food & Baking":
            value = "fab";
            break;
        case "Pets":
            value = "pet";
            break;
        case "Gardening":
            value = "grd";
            break;
        case "Travel":
            value = "trv";
            break;
        case "Video":
            value = "vid";
            break;
        default:
            value = null;
    }

    if(viewEnum.settings.filters.enabledWithStrFilter) {
        value = "sft";
    }

    return value;
};
const getAuthEnum = (user) => {
    let value = null;
    if (!user) {
        value = "u";
    } else {
        value = "a";
    }
    return value;
};
const getUserEnum = (user) => {
    let value = null;
    if (!user) {
        value = "otsu";
    } else {
        value = `${user.firstName.charAt(0).toLowerCase()}${user.lastName.toLowerCase()}`;
    }
    return value;
};

const _fetchCache = async (req, cacheKey) => await req.app.redisClient.get(`${cacheKey}`);
const _setCacheArtifacts = async (cache) => {
    return {
        data: !!cache ? JSON.parse(cache) : null,
        fromCache: !!cache
    }
}