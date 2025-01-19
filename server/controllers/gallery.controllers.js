import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { Photo } from "../classes/gallery.classes.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import PhotoModel from "../db/models/photo.model.js";
import mongoose from "mongoose";
import photoModel from "../db/models/photo.model.js";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    let
        gallery = {
            fullGallery: [],
            photoCount: 0,
            fetchTS: convertTimestamp(new Date())
        };

    let dataCached = await req.redisClient.get(`${req.originalUrl}`);

    if(dataCached === null) {
        const
            preprocessedPhotoList = await PhotoModel
                .find({}, "-srcSet -cloudinary._id -download._id -captions._id", null)
                .populate('user', "firstName lastName"),
            processList = [...preprocessedPhotoList];

        gallery.photoCount = await PhotoModel.countDocuments();
        gallery.fullGallery = processList.map((photo, index) => {
            let processedPhoto = {
                ...photo._doc
            };

            // Set an Order
            processedPhoto.order = index || 0;

            // Move Captions Up a Level For Front-End Consumption
            processedPhoto.title = processedPhoto.captions.title;
            processedPhoto.description = processedPhoto.captions.description;
            delete processedPhoto.captions;

            // Transform User
            processedPhoto.user = {
                fullName: `${processedPhoto.user.firstName} ${processedPhoto.user.lastName}`,
                _id: processedPhoto.user._id
            };
            delete processedPhoto.user.firstName;
            delete processedPhoto.user.lastName;

            // Process Dates To Specific Format
            processedPhoto.createdAt = convertTimestamp(photo.createdAt);
            processedPhoto.updatedAt = convertTimestamp(photo.updatedAt);

            return processedPhoto;
        });

        // Set Cache
        await req.redisClient.setEx(req.originalUrl, 120, JSON.stringify(gallery));

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
    const galleryPhoto = await PhotoModel.find({
        _id: req.body._id
    }, null, null);

    if(galleryPhoto) {
        return res.status(200).json({
            data: galleryPhoto
        });
    } else {
        res.status(404);
        throw new Error('Gallery Photo Not Found');
    }
});

// @access Private
export const addPhoto = asyncHandler(async (req, res, next) => {
    const galleryPhotoCount = await PhotoModel.countDocuments();

    let photo = new Photo(req.body);
    let uploadFolderPath = _configureFolderPath(photo.getTags());
    photo.setOrder(galleryPhotoCount + 1);
    photo.setUser(new mongoose.Types.ObjectId(req.user._id));

    try {
        const cloudinaryResponse = await uploadToCloudinary(photo.getSrc(), uploadFolderPath);
        photo.setSrc(cloudinaryResponse.url);
        photo.setCloudinary(cloudinaryResponse);

        const photoCreated = await PhotoModel.create({
            src: photo.getSrc(),
            alt: photo.getAlt(),
            width: photo.getWidth(),
            height: photo.getHeight(),
            srcSet: null,
            captions: {
                title: photo.getCaptions().title,
                description: photo.getCaptions().description,
            },
            download: {
                url: photo.getDownload().url,
                filename: photo.getDownload().filename
            },
            tags: photo.getTags(),
            user: photo.getUser(),
            cloudinary: photo.getCloudinary()
        });

        return res
            .status(200)
            .json({
                message: "Photo Uploaded!",
                data: photoCreated
            });
    } catch(err) {
        console.error(err);

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
    if(false) {
        return res.status(200).json({
            data: null
        });
    } else {
        res.status(400);
        throw new Error('Unable to Delete Gallery Photo');
    }
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