import {
    FolderInvoker,
    FamilyCommand, PetsCommand, FoodCommand, GardeningCommand, TravelCommand
} from "../classes/folder.class.js";
import {temporalizeTimestamp} from "./time.utils.js";

export const setCloudinaryFolderPath = (tags) => {
    // This fxn showcases working with the command design pattern in javascript form.
    const folderInvoker = new FolderInvoker();

    // Register all Commands
    folderInvoker.addCommand(new FamilyCommand(tags));
    folderInvoker.addCommand(new PetsCommand(tags));
    folderInvoker.addCommand(new FoodCommand(tags));
    folderInvoker.addCommand(new GardeningCommand(tags));
    folderInvoker.addCommand(new TravelCommand(tags));

    return folderInvoker.executeCommands(tags);
}

export const formatPhotoForFrontEndConsumption = (sourceData, index) => {
    let photo = createPhotoTemplate(sourceData);

    // Set an Order
    setPhotoIndex(photo, index);

    // Move Captions Up a Level For Front-End Consumption
    setPhotoCaptions(photo, sourceData.captions);

    // Move Dimensions Up a Level For Front-End Consumption
    setPhotoDimensions(photo, sourceData.dimensions);

    // Condense User Details
    setPhotoOwner(photo);

    // Set & Format Photo Timestamps
    setPhotoTimestamps(photo, sourceData);

    // Set the uKey For Frontend Tables & Lists
    setUniqueKey(photo);

    // Set GPS Coords if Available and Build PinDrop Map Link if Applicable
    setPhotoGPSData(photo, sourceData);

    return photo;
}

const createPhotoTemplate = (sourceData) => ({
    ...sourceData._doc,
    gps: {
        latitude: null,
        longitude: null,
        altitude: null,
        mapLink: null
    },
    uniqueKey: null
});

const setPhotoIndex = (photo, i) => photo.order = i + 1;

const setPhotoCaptions = (photo, captions) => {
    photo.title = captions.title;
    photo.description = captions.description;
    delete photo.captions;
    return photo;
}

const setPhotoDimensions = (photo, dimensions) => {
    photo.width = dimensions.width;
    photo.height = dimensions.height;
    delete photo.dimensions;
    return photo;
}

const setPhotoOwner = (photo) => {
    photo.user = {
        fullName: `${photo.user.firstName} ${photo.user.lastName}`,
        _id: photo.user._id
    };
    delete photo.user.firstName;
    delete photo.user.lastName;
    return photo;
}

const setPhotoTimestamps = (photo, sourceData) => {
    let // Process Dates To Specific Format
        convertedTimestampCreate = temporalizeTimestamp(sourceData.createdAt, { dateStyle: "short", timeStyle: "short" }),
        convertedTimestampLastUpdate = temporalizeTimestamp(sourceData.updatedAt, { dateStyle: "short", timeStyle: "short" });

    photo.createdAt = convertedTimestampCreate;
    photo.updatedAt = convertedTimestampCreate === convertedTimestampLastUpdate ?
        "-" : convertedTimestampLastUpdate;

    photo.photoTakenOn = sourceData.photoTakenOn === "Unknown" ? "Unknown" : sourceData.photoTakenOn;

    return photo;
}

const setPhotoGPSData = (photo, sourceData) => {
    photo.gps.altitude = sourceData.gps.altitude;
    photo.gps.latitude = sourceData.gps.latitude;
    photo.gps.longitude = sourceData.gps.longitude;
    photo.gps.mapLink =
        photo.gps.altitude === "Unknown" &&
        photo.gps.latitude === 0 &&
        photo.gps.longitude === 0 ?
            "No Link Available" : `https://openstreetmap.org/?mlat=${photo.gps.latitude}&mlon=-${photo.gps.longitude}`;

    return photo;
}

const setUniqueKey = (photo) => {
    photo.uniqueKey = photo.__v +
        photo._id.toString().slice(photo._id.toString().length - 4) +
        photo.user._id.toString().slice(photo.user._id.toString().length - 4);
    return photo;
}