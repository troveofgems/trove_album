import { uploadToCloudinary, removeFromCloudinary } from "../services/cloudinary.service.js";
import { Photo } from "../classes/gallery.classes.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import PhotoModel from "../db/models/photo.model.js";
import sanitize from "mongo-sanitize";
import mongoose from "mongoose";
import {
    captureTimestamp,
    processBenchmarks, trackAPIReceiveTime,
} from "../util/api.benchmarker.utils.js";
import {processResultsForAllPromises, waitForPromises} from "../util/promise.resolver.utils.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    let
        gallery = {
            fullGallery: [],
            photoCount: 0,
            fetchTS: convertTimestamp(new Date())
        };

    let dataCached = null //await req.redisClient.get(`${req.originalUrl}`);

    if(dataCached === null) {
        const
            preprocessedPhotoList = await PhotoModel
                .find({}, "-srcSet -cloudinary._id -download._id -captions._id -device._id -dimensions._id -gps._id", null)
                .populate('user', "firstName lastName"),
            processList = [...preprocessedPhotoList];

        gallery.photoCount = await PhotoModel.countDocuments();
        gallery.fullGallery = processList.map((photo, index) => {
            let processedPhoto = {
                ...photo._doc,
                uniqueKey: null
            };

            // Set an Order
            processedPhoto.order = (index || 0);

            // Move Captions Up a Level For Front-End Consumption
            processedPhoto.title = processedPhoto.captions.title;
            processedPhoto.description = processedPhoto.captions.description;
            delete processedPhoto.captions;

            // Move Dimensions Up a Level For Front-End Consumption
            processedPhoto.width = processedPhoto.dimensions.width;
            processedPhoto.height = processedPhoto.dimensions.height;
            delete processedPhoto.dimensions;

            // Transform User
            processedPhoto.user = {
                fullName: `${processedPhoto.user.firstName} ${processedPhoto.user.lastName}`,
                _id: processedPhoto.user._id
            };
            delete processedPhoto.user.firstName;
            delete processedPhoto.user.lastName;

            let // Process Dates To Specific Format
                convertedTimestampCreate = convertTimestamp(photo.createdAt),
                convertedTimestampLastUpdate = convertTimestamp(photo.updatedAt);

            processedPhoto.createdAt = convertedTimestampCreate;
            processedPhoto.updatedAt = convertedTimestampCreate === convertedTimestampLastUpdate ?
                "-" : convertedTimestampLastUpdate;

            // Set the uKey
            processedPhoto.uniqueKey = processedPhoto.__v +
             processedPhoto._id.toString().slice(processedPhoto._id.toString().length - 4) +
             processedPhoto.user._id.toString().slice(processedPhoto.user._id.toString().length - 4);

            return processedPhoto;
        });

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

// @access Private
export const addPhoto = asyncHandler(async (req, res, next) => {
    const
        photo = new Photo(
            req.body,
            new mongoose.Types.ObjectId(req.user._id)
        ),
        uploadFolderPath = _configureFolderPath(photo.getTags());

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

    const // Attempt Removal of Resources From Cloudinary Storage and MongoDB
        resolvedPromises = await waitForPromises(
            [
                removeFromCloudinary(sanitize(req.body.cloudinaryPublicId)),
                PhotoModel.findByIdAndDelete(sanitize(req.params.id), null)
            ], ["Cloudinary", "MongoDB"],
            next
        ),
        processedPromises = processResultsForAllPromises(resolvedPromises, "Unable to Remove Photo From");

    const allAPIsCompletedSuccessfully = processedPromises.data?.every(item => item.statusCode === 200);
    let message = allAPIsCompletedSuccessfully ?
        "Photo Removed!" : "Photo Removal From Some Sources Failed...";

    return res
        .status(processedPromises.statusCode)
        .json({
            data: processedPromises,
            message,
            benchmarks: processBenchmarks(req)
        });
});

const _configureFolderPath = (tags) => {
    let folderPath = "";
    const
        setForFamilyAndFriends = tags.indexOf("Family & Friends") >= 0,
        setForPets = tags.indexOf("Pets") >= 0,
        setForFoodAndBaking = tags.indexOf("Food & Baking") >= 0,
        setForGardening = tags.indexOf("Gardening") >= 0,
        setForTravel = tags.indexOf("Travel") >= 0;

    if(setForFamilyAndFriends) {
        folderPath = "tog/family";
    } else if (setForPets) {
        folderPath = "tog/pets";
    } else if (setForFoodAndBaking) {
        folderPath = "tog/food";
    } else if (setForGardening) {
        folderPath = "tog/gardening";
    } else if (setForTravel) {
        folderPath = "tog/travel";
    } else {
        folderPath = "tog/uncategorized"
    }

    return folderPath;
}

function convertTimestamp(timestamp) {
    const
        date = new Date(timestamp),
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        formattedDate = `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`,
        hours = date.getHours().toString().padStart(2, '0'),
        minutes = date.getMinutes().toString().padStart(2, '0');

    return `${formattedDate} @ ${hours}:${minutes}`;
}