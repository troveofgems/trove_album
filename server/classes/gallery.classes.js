import {setFolderPath} from "../util/photo.utils.js";

const
    NOT_SET = 'not set',
    LAT_NOT_SET = 0,
    LONG_NOT_SET = 0;

export class Photo {
    constructor(
        {   // Req.body Artifacts
            captions = { title: NOT_SET, description: NOT_SET, alt: NOT_SET },
            dates = { photoTakenOn: NOT_SET, year: null },
            device = { make: NOT_SET, model: NOT_SET },
            dimensions = { height: 0, width: 0, sizeInKB: 0 },
            download = { url: NOT_SET, filename: NOT_SET },
            gps = { type: 'Point', coordinates: [LONG_NOT_SET, LAT_NOT_SET], altitude: NOT_SET },
            provider = { url: NOT_SET, publicOrBucketId: NOT_SET, name: NOT_SET, deleteUrl: NOT_SET, status: NOT_SET },
            srcSet = null,
            tags = []
        },
        user = null
    ) {
        // Photo Provider and Folder Paths
        this.photoProviderData = setFolderPath(tags);

        // Captions
        this.captions = {
            alt: captions.alt,
            description: captions.description,
            title: captions.title,
        };

        // Dates
        this.dates = {
            photoTakenOn: dates.photoTakenOn,
            year: (
                dates.photoTakenOn === undefined ||
                dates.photoTakenOn === null ||
                dates.photoTakenOn === "Unknown"
            ) ?
                "Unknown" :
                new Date(dates.photoTakenOn.split(",")[0]).getFullYear()
        };

        // Device
        this.device = {
            make: device.make,
            model: device.model
        };

        // Dimensions
        this.dimensions = {
            width: dimensions.width,
            height: dimensions.height,
            sizeInKB: dimensions.sizeInKB
        };

        // Download
        this.download = {
            url: "",
            filename: download.filename,
        };

        // GPS
        this.gps = {
            type: 'Point',
            coordinates: gps.latitude === "Unknown" && gps.longitude === "Unknown" ?
                [0, 0] : [parseFloat(gps.longitude), parseFloat(gps.latitude)],
            altitude: gps.altitude,
            mapLink: null
        };

        // Provider
        this.provider = {
            url: provider.url,
            publicOrBucketId: this.photoProviderData.publicOrBucketId,
            name: this.photoProviderData.providerName,
            deleteUrl: this.photoProviderData.deleteUrl,
            status: this.photoProviderData.status
        };

        // Source Sets
        this.srcSet = srcSet;

        // Tags
        this.tags = tags;

        // User
        this.user = user;
    }

    // Photo Property Getters
    getPhoto() {
        return this;
    }

    getProvider() {
        return this.provider.name;
    }

    getPublicOrBucketId() {
        return this.provider.publicOrBucketId;
    }

    // Photo Property Setters
    setProviderDisplayUrl(displayUrl) {
        this._nonEmptyValueRequired(displayUrl, "displayUrl");
        return this.provider.url = displayUrl;
    }

    setProviderDeleteUrl(deleteUrl) {
        this._nonEmptyValueRequired(deleteUrl, "deleteUrl");
        return this.provider.deleteUrl = deleteUrl;
    }

    setPhotoSrcSet(srcSet) {
        return this.srcSet = srcSet;
    }

    // Photo Property Validators
    _nonEmptyValueRequired(val, propName) {
        if(val === "") throw `${propName} is required`;
    }
}