import {temporalizeTimestamp} from "./time.utils.js";
import {
    FamilyCommand,
    FolderInvoker,
    FoodCommand,
    GardeningCommand,
    PetsCommand,
    TravelCommand
} from "../classes/folder.class.js";
import {ImageProviders} from "../constants/photo.upload.path.constants.js";

const photoTransformations = [
    (data, source) => createPhotoTemplate(data, source),
    (data, source, index, skip) => setPhotoIndex(data, index, skip),
    (data, source) => setPhotoSrc(data, source.provider),
    (data, source) => setPhotoSrcSet(data, source.srcSet),
    (data, source) => setPhotoCaptions(data, source.captions),
    (data, source) => setPhotoDimensions(data, source.dimensions),
    (data, source) => setPhotoOwner(data, source.user),
    (data, source) => setPhotoTimestamps(data, source.createdAt, source.updatedAt, source.dates.photoTakenOn),
    (data, source) => setUniqueKey(data, source),
    (data, source) => setPhotoGPSData(data, source)
];

export const formatPhotoForFrontEndConsumption = (sourceData, index, skip) => photoTransformations
    .reduce((acc, transform) =>
        transform(acc, sourceData, index, skip),
        sourceData
    );

export const setFolderPath = (tagList, provider = ImageProviders.IMGBB) => {
    const folderInvoker = new FolderInvoker(provider);

    // Register all Commands
    folderInvoker.addCommand(new FamilyCommand(tagList));
    folderInvoker.addCommand(new PetsCommand(tagList));
    folderInvoker.addCommand(new FoodCommand(tagList));
    folderInvoker.addCommand(new GardeningCommand(tagList));
    folderInvoker.addCommand(new TravelCommand(tagList));

    return {
        providerName: folderInvoker.provider,
        publicOrBucketId: folderInvoker.executeCommands(tagList),
        status: "processing"
    }
};

const createPhotoTemplate = (photo, sourceData) => ({
    ...sourceData._doc,
    gps: {
        coordinates: [],
        altitude: null,
        mapLink: null
    },
    key: null,
    srcSet: []
});

const setPhotoIndex = (photo, i, s) => ({
    ...photo,
    order: i + s
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

const setPhotoOwner = (photo, user) => ({
    ...photo,
    user: {
        fullName: `${user.firstName} ${user.lastName}`,
        _id: user._id,
        firstName: undefined,
        lastName: undefined
    }
});

const setPhotoTimestamps = (photo, createdAt, updatedAt, photoTakenOn, dateStyle = "short", timeStyle = "short") => ({
    ...photo,
    createdAt: temporalizeTimestamp(createdAt, { dateStyle, timeStyle }),
    updatedAt: temporalizeTimestamp(createdAt, { dateStyle, timeStyle }) ===
    temporalizeTimestamp(updatedAt, { dateStyle, timeStyle }) ?
        "-" :
        temporalizeTimestamp(updatedAt, { dateStyle, timeStyle }),
    photoTakenOn: photoTakenOn === "Unknown" ? "Unknown" : photoTakenOn
});

const setPhotoGPSData = (photo, sourceData, thirdPartyMapProvider = "openStreetMap") => ({
    ...photo,
    gps: {
        ...sourceData.gps,
        mapLink: (
            (
                sourceData.gps.coordinates[0] === 0 &&
                sourceData.gps.coordinates[1] === 0
            ) ?
                "No Link Available" :
                setMapLink(thirdPartyMapProvider, sourceData.gps.coordinates)
        )
    }
});

const setUniqueKey = (photo, source, photoIdLen = 4, userIdLen = 4) => ({
    ...photo,
    key: source.__v +
        source._id.toString().slice(source._id.toString().length - photoIdLen) +
        source.user._id.toString().slice(source.user._id.toString().length - userIdLen)
});

const setMapLink = (thirdPartyMapProvider, coordinates) => {
    switch(thirdPartyMapProvider) {
        case "openStreetMap": // TODO: Expand Provider Options Later. Avoiding GoogleMaps due to inaccuracy of their maps.
            return `https://openstreetmap.org/?mlat=${coordinates[1]}&mlon=-${coordinates[0]}`;
        case "mapProviderOption2Placeholder":
            return "";
        default:
            return null;
    }
};

const setPhotoSrc = (photo, provider) => ({
    ...photo,
    src: provider.url
});

const setPhotoSrcSet = (photo, srcSet) => ({
    ...photo,
    srcSet
});
