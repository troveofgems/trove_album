import {uploadToImgBB} from "./imgbb.service.js";
import {uploadToCloudinary} from "./cloudinary.service.js";

import {ImageProviders} from "../constants/photo.upload.path.constants.js";
import {deleteCache} from "../util/cache.utils.js";

export const uploadToProvider = async (provider, srcData, publicOrBucketId, photo, mongoDBResourceId, req) => {
    if(provider === ImageProviders.IMGBB) await uploadToImgBB(srcData, publicOrBucketId, photo, mongoDBResourceId);
    if(provider === ImageProviders.CLOUDINARY) await uploadToCloudinary(srcData, publicOrBucketId);
    // Add more providers below as needed. Follow the format.

    // Delete Cache if Exists, TODO: Enable Delete Cache On Upload New Photo Completed
    //deleteCache(req, "/v1/api/gallery/photos");
};