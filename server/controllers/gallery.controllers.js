import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Classes Models & Services
import PhotoModel from "../db/models/photo.model.js";

// Utils
import {getGalleryTemplate} from "../util/filter.utils.js";
import {
    createMapForTravelPhotos,
    processGalleryPhotos
} from "../util/photo.utils.js";
import {markTimestamp} from "../util/time.utils.js";
import {cacheResults, probeForCache} from "../util/cache.utils.js";
import {sendResponse} from "./send.controller.utils.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const // First Check for Redis Cache Entry & Construct Appropriate Cache Data
        cacheProbe = await probeForCache(req),
        sendCachedResponse = cacheProbe.cacheFound && !!cacheProbe.data,
        cacheCallResults = !cacheProbe.cacheFound && cacheProbe.data === null;

    if(sendCachedResponse) {
        return sendResponse(res, 200, cacheProbe.data, cacheProbe.cacheFound, cacheProbe.cacheKey, 304);
    }

    const // No Cache, So Continue With Query and Next Check Data & Page Quotas to See if Request Should Continue
        { gallery, filterQuery } = await getGalleryTemplate(req.query.uiFetchSettings),
        quotaOrMaxPageReached =  gallery.photos.fetchQuotaReached &&
            gallery.photos.pagination.page > gallery.photos.pagination.maxPages;

    if(quotaOrMaxPageReached) {
        return sendResponse(res, 200, gallery, cacheProbe.cacheFound, cacheProbe.cacheKey, null);
    }

    let // Continue with Request and Send to DB For Processing
        excludePhotoKeys = "-download._id -captions._id -device._id -dimensions._id -gps._id -provider.deleteUrl",
        processList = [],
        preprocessedPhotoList =
            await PhotoModel
                .find(
                    filterQuery,
                    excludePhotoKeys,
                    null
                )
                .skip(gallery.UIFetchSettings.offset || 0)
                .limit(gallery.UIFetchSettings.limit || 10)
                .populate('user', "firstName lastName"),
        processTravelPhotos = gallery.UIFetchSettings.settings.filters.category === "Travel";

    processList = [...preprocessedPhotoList];

    // General Processing For Gallery Photos
    processGalleryPhotos(gallery, processList);

    // Deeper Processing For Travel Photos
    if(processTravelPhotos) { createMapForTravelPhotos(gallery); }

    // Set Cache via Background Process
    if(cacheCallResults) { cacheResults(req, gallery, 500, cacheProbe.cacheKey); }

    return sendResponse(
        res,
        200,
        gallery,
        false,
        cacheProbe.cacheKey,
        null
    );
});

// @access Public
export const fetchPhotoById = asyncHandler(async (req, res, next) => {
    try {
        const
            excludePhotoKeys = "",
            galleryPhoto = await PhotoModel
                .findById(req.params.id, excludePhotoKeys, null)
                .populate('user');

        return res.status(200).json({
            data: galleryPhoto,
            fetchTS: markTimestamp(),
        });
    } catch(err) {
        return next(err);
    }
});