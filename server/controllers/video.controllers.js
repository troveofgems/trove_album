import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Classes Models & Services
import VideoModel from "../db/models/video.model.js";

// Utils
import {markTimestamp} from "../util/time.utils.js";
import {cacheResults, probeForCache} from "../util/cache.utils.js";
import {sendResponse} from "./send.controller.utils.js";

// @access Public
export const fetchVideos = asyncHandler(async (req, res, next) => {
    /*const // First Check for Redis Cache Entry & Construct Appropriate Cache Data
        cacheProbe = await probeForCache(req),
        sendCachedResponse = cacheProbe.cacheFound && !!cacheProbe.data,
        cacheCallResults = !cacheProbe.cacheFound && cacheProbe.data === null;

    if(sendCachedResponse) {
        return sendResponse(res, 200, cacheProbe.data, cacheProbe.cacheFound, cacheProbe.cacheKey, 304);
    }*/
    let videoList = await VideoModel
        .find(
        {},
            "title description provider.metadata provider.videoId provider.assets.mp4 provider.assets.thumbnail provider.assets.hsl",
            null
        )
        .where('provider._public').equals(true);


    videoList = videoList.map((video) => (
        {
            ...video._doc,
            height: getMetadataValue(video.provider.metadata, "Nat Height") + "px",
            width: getMetadataValue(video.provider.metadata, "Nat Width") + "px"
        }
    ))

    return sendResponse(
        res,
        200,
        {
            videoList
        },
        false,
        "",
        null
    );
});

// @access Public
export const fetchVideoById = asyncHandler(async (req, res, next) => {
    try {


        return res.status(200).json({
            data: null,
            fetchTS: markTimestamp(),
        });
    } catch(err) {
        return next(err);
    }
});

// @access Public
export const fetchVideoStream = asyncHandler(async (req, res, next) => {
    console.log("Fetch Video Stream: ", req.body, req.query, req.params);
    try {

        return res.status(200).json({
            data: null,
            fetchTS: markTimestamp(),
        });
    } catch(err) {
        return next(err);
    }
});

function getMetadataValue(metadataArray, key) {
    const result = metadataArray.find(item => item.key === key);
    return result ? result.value : null;
}