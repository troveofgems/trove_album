// File Export Constants & Vars
const
    { APP_PREFIX_HIERARCHY, NODE_ENV, FORCE_CACHING} = process.env,
    enforceCaching = ((NODE_ENV === "production") || FORCE_CACHING);

// File Exports
export const probeForCache = async (req) => {
    const
        uiFS = JSON.parse(req.query.uiFetchSettings),
        viewEnum = _getViewEnum(uiFS),
        authEnum = _getAuthEnum(req.user),
        userEnum = _getUserEnum(req.user),
        constructedCacheKey = `${APP_PREFIX_HIERARCHY}${viewEnum}:${authEnum}:${userEnum}:${uiFS.page}`;

    if(enforceCaching) {
        let cacheFound = await _fetchCache(req, constructedCacheKey);
        return {
            cacheFound: !!cacheFound,
            data: !!cacheFound ? JSON.parse(cacheFound) : null,
            cacheKey: constructedCacheKey
        }
    }
};
export const cacheResults = async (req, dataToCache, expires = 1, cacheKey) => {
    if(enforceCaching) {
        await req.app.redisClient.set(cacheKey, JSON.stringify(dataToCache));
    }
    return req;
};
export const deleteCache = async (req, cacheKeyHierarchy) => {
    if(enforceCaching) {
        let redisStream = req.app.redisClient.scanStream({
            match: `${cacheKeyHierarchy}*`
        });

        redisStream.on("data", function (keys) {
            if(keys.length) {
                let pipeline = req.app.redisClient.pipeline();
                keys.forEach(function(key) {
                    pipeline.del(key);
                });
                pipeline.exec();
            }
        });

        redisStream.on("end", function () {
            if(NODE_ENV === "development") {
                console.log("Redis Key Purge Completed!");
            }
        });
    }
    return req;
};

// Internal Helper Functions
const _fetchCache = async (req, cacheKey) => await req.app.redisClient.get(`${cacheKey}`);
const _getViewEnum = (viewEnum) => {
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
const _getAuthEnum = (user) => {
    let value = null;
    if (!user) {
        value = "u";
    } else {
        value = "a";
    }
    return value;
};
const _getUserEnum = (user) => {
    let value = null;
    if (!user) {
        value = "otsu";
    } else {
        value = `${user.firstName.charAt(0).toLowerCase()}${user.lastName.toLowerCase()}`;
    }
    return value;
};