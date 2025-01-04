export class Photo {
    constructor(id, src, alt, width, height, srcSet, captions, download, tags, order) {
        this.id = id;
        this.src = src;
        this.alt = alt;
        this.width = width;
        this.height = height;
        this.srcSet = srcSet;
        this.captions = captions;
        this.download = download;
        this.tags = tags;
        this.order = order;
    }

    //Getters
    getId() {
        return this.id;
    }

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

    // Validator
    _nonEmptyValueRequired(val, propName) {
        if(val === "") throw `${propName} is required`;
    }

    //Setters
    setId(id) {
        this._nonEmptyValueRequired(id, "id");
        this.id = id;
    }

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
        this.order = order;
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