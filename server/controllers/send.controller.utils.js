import {markTimestamp} from "../util/time.utils.js";

export const sendResponse = (
    res,
    mainStatusCode = 200,
    data = {},
    fromCache = false,
    cacheKey = "",
    subStatusCode = null,
    message = null
) => {
    return res
        .status(mainStatusCode) // DO NOT SET TO 304, RTK will set data to null.
        .json({
            data: data,
            fetchTS: markTimestamp(),
            fromCache: fromCache,
            cacheKey: cacheKey,
            subStatusCode: subStatusCode, // Set 304s Here...
            message:  message
        });
};