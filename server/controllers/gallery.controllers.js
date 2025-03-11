import sanitize from "mongo-sanitize";
import mongoose from "mongoose";
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
import {
    DELETE_DEFAULT_ERROR_MESSAGE, DELETE_DEFAULT_MIXED_MESSAGE,
    DELETE_DEFAULT_SUCCESS_MESSAGE
} from "../constants/app.error.message.constants.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    let
        gallery = {
            fullGallery: [],
            photoCount: 0,
            fetchTS: markTimestamp()
        };

    let dataCached = null //await req.redisClient.get(`${req.originalUrl}`);

    if(dataCached === null) {
        const
            preprocessedPhotoList = await PhotoModel
                .find({}, "-srcSet -cloudinary._id -download._id -captions._id -device._id -dimensions._id -gps._id", null)
                .populate('user', "firstName lastName"),
            processList = [...preprocessedPhotoList];

        gallery.photoCount = await PhotoModel.countDocuments();
        gallery.fullGallery = processList
            .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index));

        // Set Cache
        //await req.redisClient.setEx(req.originalUrl, 120, JSON.stringify(gallery));

        return res
            .status(200)
            .json({
                data: gallery,
                fromCache: false
            });
    } else {
        return res
            .status(200)
            .json({
                data: JSON.parse(dataCached),
                fromCache: true
            });
    }
});

// @access Public
export const fetchPhotoById = asyncHandler(async (req, res, next) => {
    try {
        const galleryPhoto = await PhotoModel.findById(req.params.id, "", null);
        return res.status(200).json({
            data: galleryPhoto
        });
    } catch(err) {
        return next(err);
    }
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