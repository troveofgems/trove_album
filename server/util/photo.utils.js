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

export const formatPhotoForFrontEndConsumption = (sourceData, index, skip) => (
    setPhotoGPSData(
        setUniqueKey(
            setPhotoTimestamps(
                setPhotoOwner(
                    setPhotoDimensions(
                        setPhotoCaptions(
                            setPhotoIndex(
                                createPhotoTemplate(sourceData),
                                index,
                                skip
                            ),
                            sourceData.captions
                        ),
                        sourceData.dimensions
                    )
                ),
                sourceData
            )
        ),
        sourceData
    )
);

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

const setPhotoIndex = (photo, i, skip) => ({
    ...photo,
    order: i + 1 + skip
});

const setPhotoCaptions = (photo, captions) => ({
    ...photo,
    title: captions.title,
    description: captions.description,
    captions: undefined
});

const setPhotoDimensions = (photo, dimensions) => ({
    ...photo,
    width: dimensions.width,
    height: dimensions.height,
    dimensions: undefined
});

const setPhotoOwner = (photo) => ({
    ...photo,
    user: {
        fullName: `${photo.user.firstName} ${photo.user.lastName}`,
        _id: photo.user._id,
        firstName: undefined,
        lastName: undefined
    }
});

const setPhotoTimestamps = (photo, sourceData, dateStyle = "short", timeStyle = "short") => ({
    ...photo,
    createdAt: temporalizeTimestamp(sourceData.createdAt, { dateStyle, timeStyle }),
    updatedAt: temporalizeTimestamp(sourceData.createdAt, { dateStyle, timeStyle }) ===
    temporalizeTimestamp(sourceData.updatedAt, { dateStyle, timeStyle }) ?
        "-" :
        temporalizeTimestamp(sourceData.updatedAt, { dateStyle, timeStyle }),
    photoTakenOn: sourceData.photoTakenOn === "Unknown" ? "Unknown" : sourceData.photoTakenOn
});

const setPhotoGPSData = (photo, sourceData, thirdPartyMapProvider = "openStreetMap") => ({
    ...photo,
    gps: {
        ...photo.gps,
        altitude: sourceData.gps.altitude,
        latitude: sourceData.gps.latitude,
        longitude: sourceData.gps.longitude,
        mapLink: (
            (
                sourceData.gps.latitude === 0 &&
                sourceData.gps.longitude === 0
            ) ?
                "No Link Available" :
                setMapLink(thirdPartyMapProvider, photo.gps)
        )
    }
});

const setUniqueKey = (photo, photoIdLen = 4, userIdLen = 4) => ({
    ...photo,
    uniqueKey: photo.__v +
        photo._id.toString().slice(photo._id.toString().length - photoIdLen) +
        photo.user._id.toString().slice(photo.user._id.toString().length - userIdLen)
});

const setMapLink = (thirdPartyMapProvider, gpsCoords) => {
    switch(thirdPartyMapProvider) {
        case "openStreetMap": // TODO: Expand Provider Options Later. Avoiding GoogleMaps due to inaccuracy of their maps.
            return `https://openstreetmap.org/?mlat=${gpsCoords.latitude}&mlon=-${gpsCoords.longitude}`;
        case "providerOption2Placeholder":
            return "";
        default:
            return null;
    }
};