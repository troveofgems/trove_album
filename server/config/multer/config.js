import multer from "multer";
import path from "node:path";

const __dirname = import.meta.dirname;
const staticTimestamp = Date.now();

const multerLimitOptions = {
    fileSize: 500000000 // 500MB limit
}

export const getAbsolutePath_VideoStorage = () => path.join(__dirname, "../../assets/uploads/videos");

const diskStorage = multer.diskStorage(
    {
        destination: getAbsolutePath_VideoStorage(),
        filename: function(req, file, callback) {
            callback(null, staticTimestamp + '-' + file.originalname);
        }
    });

export default {
    diskStorage,
    multerLimitOptions,
    staticTimestamp
}