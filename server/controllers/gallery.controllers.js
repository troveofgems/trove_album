import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { Photo } from "../classes/gallery.classes.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import PhotoModel from "../db/models/photo.model.js";
import mongoose from "mongoose";

// @access Public
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const galleryPhotos = await PhotoModel.find({}, null, null);

    if(galleryPhotos) {
        return res.status(200).json({
            data: galleryPhotos
        });
    } else {
        res.status(404);
        throw new Error('Gallery Photos Not Found');
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
        folderPath = "travel";
    }

    return folderPath;
}