export class Photo {
    constructor({src, alt, width, height, srcSet = null, captions, download, tags, order = null, user = null}) {
        this.src = src;
        this.alt = alt;
        this.width = width;
        this.height = height;
        this.srcSet = srcSet;
        this.captions = captions;
        this.download = download;
        this.tags = tags;
        this.order = order;
        this.user = user;
        this.cloudinary = null;
    }

    //Getters
    getSrc() {
        return this.src;
    }

    getAlt() {
        return this.alt;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getSrcSet() {
        return this.srcSet;
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

    getOrder() {
        return this.order;
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

    setOrder(order){
        this._nonEmptyValueRequired(order, "order");
        return this.order = order;
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

export class Album {
    constructor(id, name, description, photos, albumTag) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.photos = photos;
        this.albumTag = albumTag;
    }
}