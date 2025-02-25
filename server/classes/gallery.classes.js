const NOT_SET = "not set";
export class Photo {
    constructor({
                    src = "someBase64String", alt = "Alt Description Of Photo", srcSet = null,
                    device = { make: NOT_SET, model: NOT_SET },
                    dimensions = { height: 0, width: 0, sizeInKB: 0 },
                    captions = { title: NOT_SET, description: NOT_SET },
                    download = { url: NOT_SET, filename: NOT_SET },
                    gps = { latitude: 0, longitude: 0, altitude: NOT_SET },
                    photoTakenOn = NOT_SET,
                    tags
    }, user = null) {
        this.src = src;
        this.alt = alt;
        this.srcSet = srcSet;
        this.captions = {
            title: captions.title,
            description: captions.description,
        };
        this.cloudinary = {
            url: null,
            publicId: null
        };
        this.device = {
            make: device.make,
            model: device.model
        };
        this.dimensions = {
            width: dimensions.width,
            height: dimensions.height,
            sizeInKB: dimensions.sizeInKB
        };
        this.download = {
            url: "",
            filename: download.filename,
        };
        this.gps = {
            latitude: gps.latitude === "Unknown" ? 0 : gps.latitude,
            longitude: gps.longitude === "Unknown" ? 0 : gps.longitude,
            altitude: gps.altitude,
        };
        this.photoTakenOn = photoTakenOn;
        this.tags = tags;
        this.user = user;
    }

    //Getters
    getSrc() {
        return this.src;
    }

    getAlt() {
        return this.alt;
    }

    getSrcSet() {
        return this.srcSet;
    }

    getWidth() {
        return this.dimensions.width;
    }

    getHeight() {
        return this.dimensions.height;
    }

    getSizeInKB() {
        return this.dimensions.sizeInKB;
    }

    getDeviceMake() {
        return this.device.make;
    }

    getDeviceModel() {
        return this.device.model;
    }

    getCaptions() {
        return this.captions;
    }

    getDownload() {
        return this.download;
    }

    getTags() {
        return this.tags;
    }

    getGPSLatitude() {
        return this.gps.latitude;
    }

    getGPSLongitude() {
        return this.gps.longitude;
    }

    getGPSAltitude() {
        return this.gps.altitude;
    }

    getUser() {
        return this.user;
    }

    getCloudinary() {
        return this.cloudinary;
    }

    // Validator
    _nonEmptyValueRequired(val, propName) {
        if(val === "") throw `${propName} is required`;
    }

    //Setters
    setSrc(src) {
        this._nonEmptyValueRequired(src, "src");
        this.src = src;
    }

    setAlt(alt) {
        this._nonEmptyValueRequired(alt, "alt");
        this.alt = alt;
    }

    setWidth(width) {
        this._nonEmptyValueRequired(width, "width");
        this.width = width;
    }

    setHeight(height) {
        this._nonEmptyValueRequired(height, "height");
        this.height = height;
    }

    setSrcSet(srcSet) {
        this._nonEmptyValueRequired(srcSet, "srcSet");
        this.srcSet = srcSet;
    }

    setCaptions(captions) {
        this._nonEmptyValueRequired(captions, "captions");
        this.captions = captions;
    }

    setDownload(download) {
        this._nonEmptyValueRequired(download, "download");
        this.download = download;
    }

    setTags(tags) {
        this._nonEmptyValueRequired(tags, "tags");
        this.tags = tags;
    }

    setUser(user){
        this._nonEmptyValueRequired(user, "user");
        return this.user = user;
    }

    setCloudinary(cloudinary){
        this._nonEmptyValueRequired(cloudinary, "cloudinary");
        return this.cloudinary = cloudinary;
    }
}

/*
export class Album {
    constructor(id, name, description, photos, albumTag) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.photos = photos;
        this.albumTag = albumTag;
    }
}*/
