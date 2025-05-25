import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Classes Models & Services
import { Photo } from "../classes/gallery.classes.js";
import PhotoModel from "../db/models/photo.model.js";

// Utils
import {getGalleryTemplate} from "../util/filter.utils.js";
import {processBenchmarks, trackAPIReceiveTime} from "../util/api.benchmarker.utils.js";
import {processResultsForAllPromises, waitForPromises} from "../util/promise.resolver.utils.js";
import {formatPhotoForFrontEndConsumption, setFolderPath} from "../util/photo.utils.js";
import {markTimestamp} from "../util/time.utils.js";
import {cacheResults, deleteCache, probeForCache} from "../util/cache.utils.js";
import {
    DELETE_DEFAULT_ERROR_MESSAGE, DELETE_DEFAULT_MIXED_MESSAGE,
    DELETE_DEFAULT_SUCCESS_MESSAGE
} from "../constants/app.error.message.constants.js";
import {uploadToProvider} from "../services/photo.provider.service.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const cacheProbe = await probeForCache(req);

    // Cache Exists from Prior Call. Return Cache Instead of proceeding with request.
    if(cacheProbe.cacheFound) {
        return res
            .status(200)
            .json({
                data: cacheProbe.data,
                fetchTS: markTimestamp(),
                fromCache: cacheProbe.cacheFound,
                cacheKey: cacheProbe.cacheKey
            });
    }

    const
        excludePhotoKeys = "-download._id -captions._id -device._id -dimensions._id -gps._id -provider.deleteUrl",
        { gallery, filterQuery } = await getGalleryTemplate(req.query.uiFetchSettings),
        quotaOrMaxPageReached =  gallery.photos.fetchQuotaReached &&
            gallery.photos.pagination.page > gallery.photos.pagination.maxPages;

    if(quotaOrMaxPageReached) {
        return res.status(200).json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: false
        });
    }

    // Continue with Request and Process DB
    let
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
                .populate('user', "firstName lastName");

    processList = [...preprocessedPhotoList];

    gallery.photos.imageList.push(
        ...processList
            .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index, 0))
    );
    gallery.photos.pullCount = processList.length;

    const processTravelPhotos = gallery.UIFetchSettings.settings.filters.category === "Travel";

    if(processTravelPhotos) {
        gallery.photos.imageList.forEach((image) => {
            const locationTime = `${image.tags[image.tags.length - 1]} ${image.tags[image.tags.length - 2]}`;

            // Add image to the appropriate group
            if (!gallery.photos.groupMap.has(locationTime)) {
                gallery.photos.groupMap.set(locationTime, []);
            }

            gallery.photos.groupMap.get(locationTime).push(image);
        });

        gallery.photos.groupMap = Object.fromEntries(gallery.photos.groupMap);
    }

    // Set Cache
    if(!cacheProbe.cacheFound) { // Can this be background Processed?
        await cacheResults(req, gallery, 500, cacheProbe.cacheKey);
    }

    return res
        .status(200)
        .json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: false,
            cacheKey: cacheProbe.cacheKey
        });
});

// @access Public
export const fetchPhotoById = asyncHandler(async (req, res, next) => {
    try {
        const
            excludePhotoKeys = "",
            galleryPhoto = await PhotoModel
                .findById(req.params.id, excludePhotoKeys, null)
                .populate('user');

        console.log("Photo Retrieved?", galleryPhoto);

        return res.status(200).json({
            data: galleryPhoto,
            fetchTS: markTimestamp(),
        });
    } catch(err) {
        return next(err);
    }
});

// @access Private
export const addPhoto = asyncHandler(async (req, res, next) => {
    const
        srcData = req.body.src,
        photo = new Photo(
            req.body,
            new mongoose.Types.ObjectId(req.user._id)
        );

    try {
        // Cleanup Unnecessary Properties For DB Storage
        delete photo.photoProviderData;

        // Create The Photo
        const storedPhoto = await PhotoModel.create(photo, null);

        // Background Process Upload - DO NOT ADD AWAIT OR THEN()
        uploadToProvider(
            photo.getProvider(),
            srcData,
            photo.getPublicOrBucketId(),
            photo,
            storedPhoto._id.toString(),
            req
        );

        return res
            .status(201)
            .json({
                message: "Photo Accepted For Processing!",
                data: storedPhoto
            });
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

// @access Private
export const updatePhoto = asyncHandler(async (req, res, next) => {
    let
        currentPhotoDetails = {},
        updatedPhoto = {};

    if(false) {
        return res.status(200).json({
            data: {
                updatesMade: {

                }
            }
        });
    } else {
        res.status(400);
        throw new Error('Unable to Update Album Photo');
    }
});

// @access Private
export const deletePhoto = asyncHandler(async (req, res, next) => {
    const  // Removes Photo from MongoDB & Sends Delete Link For Provider To Frontend
        photoId = req.params.id,
        photo = await PhotoModel.findById(photoId, "provider.deleteUrl", null),
        { deleteUrl } = photo.provider;

    // MongoDB Delete
    await PhotoModel.findByIdAndDelete(photoId, null);

    return res
        .status(202)
        .json({
            data: {
                deleteUrl
            },
            message: "Success...Photo Removed From MongoDB. Delete From Provider To Complete Process",
            statusCode: 202
        });
});