import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Classes Models & Services
import { Photo } from "../classes/gallery.classes.js";
import PhotoModel from "../db/models/photo.model.js";
import { uploadToCloudinary, removeFromCloudinary } from "../services/cloudinary.service.js";

// Utils
import {advancedFiltering, buildQuery} from "../util/filter.utils.js";
import {processBenchmarks, trackAPIReceiveTime} from "../util/api.benchmarker.utils.js";
import {processResultsForAllPromises, waitForPromises} from "../util/promise.resolver.utils.js";
import {formatPhotoForFrontEndConsumption, setCloudinaryFolderPath,} from "../util/photo.utils.js";
import {markTimestamp} from "../util/time.utils.js";
import {cacheResults, deleteCache, probeForCache} from "../util/cache.utils.js";
import {
    DELETE_DEFAULT_ERROR_MESSAGE, DELETE_DEFAULT_MIXED_MESSAGE,
    DELETE_DEFAULT_SUCCESS_MESSAGE
} from "../constants/app.error.message.constants.js";

const setCountDocumentFilter = (fetchSettings) => (
    (
        fetchSettings.filters.category === "*" ||
        fetchSettings.filters.category === "All Items"
    ) ?
        {} :
        { tags: { $in: [`${fetchSettings.filters.category}`] }}
)

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const convertPageSettingsToJson = !!req.query.fetchSettings && JSON.parse(req.query.fetchSettings);

    let
        findQuery = {},
        totalResources = 0;

    if(!!convertPageSettingsToJson) {
        findQuery = setCountDocumentFilter(convertPageSettingsToJson);
    }

    totalResources = await PhotoModel.countDocuments(findQuery);

    console.log("Work With: ", convertPageSettingsToJson);
    let
        gallery = {
            photos: {
                imageList: [],
                groupMap: new Map(),
                pullCount: 0,
                totalPhotoCount: totalResources,
                pagination: {
                    page: convertPageSettingsToJson.page || 1,
                    offset: convertPageSettingsToJson.offset || 0,
                    maxPages: Math.ceil(totalResources / (convertPageSettingsToJson.limit || 10)),
                    limit: convertPageSettingsToJson.limit || 10
                }
            },
            /*filters: convertFiltersToJson,
            */
        },
        existentCache = false; //await probeForCache(req);

    const maximumTriesExceeded = (convertPageSettingsToJson.page > convertPageSettingsToJson.maxPages);
    if(maximumTriesExceeded) {
        return res.status(200).json({
            data: null,
            message: "No More Photos!"
        });
    }

    // Cache Exists from Prior Call. Return Cache Instead of proceeding with request.
    if(existentCache) return res
        .status(200)
        .json(existentCache);

    /*const
        processCategoryWithFilters = gallery.filters.category !== "*" && !!gallery.filters.filterStr;

    if(processAllItemsUsingFilters) {
        advancedFiltering(gallery.filters.filterStr.query, gallery);
        findQuery = buildQuery(gallery);
    }

    if(processCategoryWithFilters) {
        let filtering = advancedFiltering(gallery.filters.filterStr);
    }*/

    const excludePhotoKeys = "-srcSet -cloudinary._id -download._id -captions._id -device._id -dimensions._id -gps._id";
    let processList = [];

    let preprocessedPhotoList = await PhotoModel
        .find(findQuery, excludePhotoKeys, null)
        .skip(convertPageSettingsToJson?.offset || 0)
        .limit(convertPageSettingsToJson?.limit || 10)
        .populate('user', "firstName lastName");

    processList = [...preprocessedPhotoList];
    console.log("To Process: ", processList.length, " records");

    gallery.photos.imageList = processList
        .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index, 0));
    gallery.photos.pullCount = processList.length;

    console.log("Processed: ", gallery.photos.imageList.length, " records");

    if(convertPageSettingsToJson.filters.category === "Travel") {
        gallery.photos.imageList.forEach((image) => {
            const locationTime = `${image.tags[image.tags.length - 1]} ${image.tags[image.tags.length - 2]}`;

            // Add image to the appropriate group
            if (!gallery.photos.groupMap.has(locationTime)) {
                gallery.photos.groupMap.set(locationTime, []);
            }

            gallery.photos.groupMap.get(locationTime).push(image);
        });
        gallery.photos.groupMap = Object.fromEntries(gallery.photos.groupMap);
        console.log("Travel Processed: ", gallery.photos.imageList.length, " records", gallery.photos.groupMap);
    }

    console.log("To Send Back: ", gallery.photos.imageList.length, " photos from ", convertPageSettingsToJson.filters.category);

    // Set Cache
    //await cacheResults(req, gallery);

    return res
        .status(200)
        .json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: false
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
        photo = new Photo(
            req.body,
            new mongoose.Types.ObjectId(req.user._id)
        ),
        uploadFolderPath = setCloudinaryFolderPath(photo.getTags());

    try {
        const cloudinaryResponse = await uploadToCloudinary(photo.getSrc(), uploadFolderPath);

        // Store Cloudinary Artifacts To Photo
        photo.setCloudinary(cloudinaryResponse);
        photo.setSrc(cloudinaryResponse.url);

        const storedPhoto = await PhotoModel.create(photo, null);

        // Delete Cache if Exists
        deleteCache(req, "/v1/api/gallery/photos");

        return res
            .status(200)
            .json({
                message: "Photo Successfully Uploaded!",
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
    trackAPIReceiveTime(req);

    const // Attempts Removal of Photo Resource From Cloudinary Storage and MongoDB
        resolvedPromises = await waitForPromises(
            [
                removeFromCloudinary(sanitize(req.body.cloudinaryPublicId)),
                PhotoModel.findByIdAndDelete(sanitize(req.params.id), null)
            ], ["Cloudinary", "MongoDB"],
            next
        ),
        processedPromises = processResultsForAllPromises(resolvedPromises, DELETE_DEFAULT_ERROR_MESSAGE);

    const allAPIsCompletedSuccessfully = processedPromises.data?.every(item => item.statusCode === 200);
    let message = allAPIsCompletedSuccessfully ?
        DELETE_DEFAULT_SUCCESS_MESSAGE : DELETE_DEFAULT_MIXED_MESSAGE;

    return res
        .status(processedPromises.statusCode)
        .json({
            data: processedPromises,
            message,
            benchmarks: processBenchmarks(req)
        });
});

// @access Public
export const searchGalleryByKeyword = asyncHandler(async(req, res, next) => {
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