import multer from "multer";
import { default as multerConfig } from "../config/multer/config.js";

export const uploadWithMulter = multer({
    storage: multerConfig.diskStorage,
    limits: multerConfig.multerLimitOptions,
    fileFilter: async function(req, file, callback) {
        const ext = file.mimetype;
        if (!ext.includes("video/")) {
            return callback(new Error('Please Select A Valid Video Format For Uploading.'));
        }

        req.locals = {
            uploadedFile: file,
            uploadedFilename: multerConfig.staticTimestamp + "-" + file.originalname,
            requiresConversion: !ext.includes("mp4")
        };

        return callback(null, true);
    }
});