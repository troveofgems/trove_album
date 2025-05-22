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
    const cacheExists = false; //await probeForCache(req)

    // Cache Exists from Prior Call. Return Cache Instead of proceeding with request.
    if(cacheExists) return res
        .status(200)
        .json(cacheExists);

    const
        excludePhotoKeys = "-download._id -captions._id -device._id -dimensions._id -gps._id -provider.deleteUrl";

    const { gallery, filterQuery } = await getGalleryTemplate(req.query.uiFetchSettings);

    if(
        gallery.photos.fetchQuotaReached &&
        gallery.photos.pagination.page > gallery.photos.pagination.maxPages
    ) {
        return res.status(200).json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: cacheExists
        });
    }

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
    //await cacheResults(req, gallery);

    return res
        .status(200)
        .json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: cacheExists
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
        throw new Error('Unable to Update Gallery Photo');
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

// @access Public
export const searchGalleryByKeyword = asyncHandler(async(req, res, next) => {
    console.log("Inside Search Gallery By Keywords Controller: ", req.query);
    const keywords = req.query.keywords ? {
        name: {
            $regex: req.query.keywords,
            $options: "i"
        }
    } : {};

    const docCount = await PhotoModel.countDocuments({...keywords});
    const gallery = await PhotoModel.find({...keywords}, null, null);

    console.log("Search Gallery By Keyword Filtering...", keywords, docCount, gallery);

    console.log("Keywords: ", keywords);

    return res.status(200).json({
        data: gallery,
        count: docCount
    });
})