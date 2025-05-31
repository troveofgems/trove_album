import {asyncHandler} from "./asyncHandler.middleware.js";
import {default as clamAVConfig} from "../config/clamav/config.js";
import {getAbsolutePath_VideoStorage} from "../config/multer/config.js";

// Scan File For Viruses
export const scanForViruses = asyncHandler(async (req, res, next) => {
    const Scanner = await clamAVConfig
        .ClamShell
        .init(
            clamAVConfig.setClamOptions({ fileList: `${req.file.destination}/` })
        );
    console.log("Scanner Init: ", Scanner);
    console.log("File: ", req.file);
    try { //${req.file.filename}
        const {isInfected, file, viruses} = await Scanner.isInfected(`${getAbsolutePath_VideoStorage()}`);

        console.log("File is Infected? ", isInfected, file, viruses);

        if(isInfected) {
            return res.status(400).json({
                error: 'Virus Detected In Uploaded File'
            });
        }

        next();
    } catch(error) {
        console.error("Error? ", error);
        next(error);
    }
});
