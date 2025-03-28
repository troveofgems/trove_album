import mongoose from "mongoose";
import sanitize from "mongo-sanitize";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Classes Models & Services
import { Photo } from "../classes/gallery.classes.js";
import PhotoModel from "../db/models/photo.model.js";
import { uploadToCloudinary, removeFromCloudinary } from "../services/cloudinary.service.js";

// Utils
import {processBenchmarks, trackAPIReceiveTime} from "../util/api.benchmarker.utils.js";
import {processResultsForAllPromises, waitForPromises} from "../util/promise.resolver.utils.js";
import {formatPhotoForFrontEndConsumption, setCloudinaryFolderPath,} from "../util/photo.utils.js";
import {markTimestamp} from "../util/time.utils.js";
import {cacheResults, deleteCache, probeForCache} from "../util/cache.utils.js";
import {
    DELETE_DEFAULT_ERROR_MESSAGE, DELETE_DEFAULT_MIXED_MESSAGE,
    DELETE_DEFAULT_SUCCESS_MESSAGE
} from "../constants/app.error.message.constants.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const totalResources = await PhotoModel.countDocuments();

    let
        gallery = {
            fullGallery: [], // Deprecate This Usage In Favor of photos nest
            photos: {
                data: [],
                pullCount: 0
            },
            photoCount: totalResources,
            fetchTS: markTimestamp(),
            pagination: {
                currentRound: Number(req.query.currentRound) || 1,
                skip: Number(req.query.skip) || 0,
                totalRounds: (Number(req.query.totalRounds) || (Math.ceil(totalResources / (Number(req.query.limit) || 10)))),
                limit: Number(req.query.limit) || 10
            }
        },
        existentCache = false; //await probeForCache(req);

    if(gallery.pagination.currentRound > gallery.pagination.totalRounds) {
        return res.status(200).json({
            data: null,
            message: "No More Photos!"
        });
    }

    if(existentCache) return res
        .status(200)
        .json(existentCache);

    const // No Cache Exists...Continue with Request
        excludePhotoKeys = "-srcSet -cloudinary._id -download._id -captions._id -device._id -dimensions._id -gps._id",
        preprocessedPhotoList = await PhotoModel
            .find({}, excludePhotoKeys, null)
            .skip(gallery.pagination.skip)
            .limit(gallery.pagination.limit)
            .populate('user', "firstName lastName"),
        processList = [...preprocessedPhotoList];

    gallery.fullGallery = processList
        .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index));

    gallery.photos.data = processList
        .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index));
    gallery.photos.pullCount = processList.length;

    // Set Cache
    //await cacheResults(req, gallery);

    return res
        .status(200)
        .json({
            data: gallery,
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