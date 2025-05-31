import mongoose from "mongoose";
import {spawn} from "node:child_process";

// Middleware
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Models & Classes
import PhotoModel from "../db/models/photo.model.js";
import VideoModel from "../db/models/video.model.js";
import { Photo } from "../classes/gallery.classes.js";

// Services
import {uploadToProvider} from "../services/photo.provider.service.js";

// Utils
import { formatPhotoForFrontEndConsumption } from "../util/photo.utils.js";
import { deleteCache } from "../util/cache.utils.js";
import { getGalleryTemplate } from "../util/filter.utils.js";
import { markTimestamp } from "../util/time.utils.js";
import { sendResponse } from "./send.controller.utils.js";
import {convertToMp4} from "../util/video.utils.js";
import {getAbsolutePath_VideoStorage} from "../config/multer/config.js";
import {uploadVideoToAPIVideo} from "../services/api.video.service.js";

const { APP_PREFIX_HIERARCHY } = process.env;

/**
 * Photo Controllers
 * */
// @access Private
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const
        excludePhotoKeys = "-download._id -captions._id -device._id -dimensions._id -gps._id -provider.deleteUrl";

    const gallery = await getGalleryTemplate(req.query.uiFetchSettings, true);

    let
        processList = [],
        preprocessedPhotoList =
            await PhotoModel
                .find(
                    {},
                    excludePhotoKeys,
                    null
                )
                .skip(0)
                .limit(100)
                .populate('user', "firstName lastName");

    processList = [...preprocessedPhotoList];

    gallery.photos.imageList.push(
        ...processList
            .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index, 0))
    );

    gallery.photos.pullCount = processList.length;

    return res
        .status(200)
        .json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: false
        });
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

        // Delete Cache is Background Processed
        deleteCache(req, `${APP_PREFIX_HIERARCHY}`);

        return sendResponse(
            res,
            201,
            storedPhoto,
            false,
            "",
            200,
            "Photo Accepted For Processing!"
        );
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

// @access Private
export const updatePhotoUsingPatch = asyncHandler(async (req, res, next) => _updatePhotoShell(req, res, req.body, "patch"));

// @access Private
export const updatePhotoUsingPut = asyncHandler(async (req, res, next) => _updatePhotoShell(req, res, req.body, "put"));

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

const _updatePhotoShell = async (req, res, updates, type) => {
    // TODO: Break out logic between actual PUT/PATCH behavior...
    const updatedPhoto = await PhotoModel.findByIdAndUpdate(
        req.params.id,
        updates,
        {}
    );

    if(!!updatedPhoto) {
        return res.status(200).json({
            data: {
                updatesMade: true,
                photoId: req.params.id,
                message: "Photo Successfully Updated!"
            }
        });
    } else {
        res.status(400);
        throw new Error('Unable to Update Album Photo');
    }
};

/**
 * Video Controllers
 * */
// @access Private
export const addVideo = asyncHandler(async (req, res, next) => {
    // Convert Movies to Mp4 If Not Already in that Format
    if(req.locals.requiresConversion) {
       // await convertToMp4(req, req.locals.uploadedFilename, getAbsolutePath_VideoStorage());
    }

    const videoCreationPayload = {
        title: req.body.title,
        description: req.body.description,
        public: req.body.public === "true",
        panoramic: req.body.panoramic === "true",
        mp4Support: true, // Hardcode this as all videos will be converted to mp4
        playerId: process.env.API_VIDEO_PLAYER_ID,
        language: "en", // Hardcode this for now
        transcript: req.body.transcript === "true",
        transcriptSummary: req.body.transcript === "true",
        tags: typeof req.body.tags === "string" ? req.body.tags.split(",") : req.body.tags,
        metadata: [
            {
                "key": "Uploader",
                "value": `${req.user.firstName} ${req.user.lastName}`
            },
            {
                "key": "Description",
                "value": `Video - `
            },
            {
                "key": "Start Time",
                "value": `${req.locals.metadataToSave.information.container.start_time}`
            },
            {
                "key": "Duration",
                "value":  `${req.locals.metadataToSave.information.container.duration}`
            },
            {
                "key": "Size",
                "value":  `${req.locals.metadataToSave.information.container.size}`
            },
            {
                "key": "Bit Rate",
                "value":  `${req.locals.metadataToSave.information.container.bit_rate}`
            },
            {
                "key": "Nat Height",
                "value":  `${req.locals.metadataToSave.information.height}`
            },
            {
                "key": "Nat Width",
                "value":  `${req.locals.metadataToSave.information.width}`
            }
        ]
    };

    // Attach Transcript Summary Attributes if they Exist
    if(req.body.transcript === "true") {
        videoCreationPayload.transcriptSummaryAttributes = req.body.transcriptSummaryAttributes.split(",");
    }

    // create a video object first
    const videoProcessed = null; //await uploadVideoToAPIVideo(req.locals.convertedFilePath, videoCreationPayload);

    let videoToStore = {
        title: req.body.title,
        description: req.body.description,
        provider: {
            ...videoProcessed
        },
        user: req.user._id
    }

    videoToStore.provider.name = process.env.DEFAULT_VIDEO_PROCESSOR;

    try {

        const storedVideo = null; // await VideoModel.create(videoToStore);
        console.log(storedVideo);

        return sendResponse(
            res,
            202,
            {},
            false,
            "",
            200,
            "Video Accepted For Processing!"
        );
    } catch(err) {
        console.error(err);
        return next(err);
    }
});