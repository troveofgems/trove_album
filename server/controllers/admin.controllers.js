import mongoose from "mongoose";

// Middleware
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";

// Models & Classes
import PhotoModel from "../db/models/photo.model.js";
import { Photo } from "../classes/gallery.classes.js";

// Services
import {uploadToProvider} from "../services/photo.provider.service.js";

// Utils
import { formatPhotoForFrontEndConsumption } from "../util/photo.utils.js";
import { deleteCache } from "../util/cache.utils.js";
import { getGalleryTemplate } from "../util/filter.utils.js";
import { markTimestamp } from "../util/time.utils.js";
import { sendResponse } from "./send.controller.utils.js";

const { APP_PREFIX_HIERARCHY } = process.env;

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