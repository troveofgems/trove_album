import {asyncHandler} from "../middleware/asyncHandler.middleware.js";
import {markTimestamp} from "../util/time.utils.js";
import {formatPhotoForFrontEndConsumption} from "../util/photo.utils.js";
import PhotoModel from "../db/models/photo.model.js";
import {getGalleryTemplate} from "../util/filter.utils.js";

// @access Private
export const fetchGalleryPhotos = asyncHandler(async (req, res, next) => {
    const
        excludePhotoKeys = "-download._id -captions._id -device._id -dimensions._id -gps._id -provider.deleteUrl";

    const gallery = await getGalleryTemplate(req.query.uiFetchSettings, true);

    let
        processList = [],
        preprocessedPhotoList =
            await PhotoModel
                .find(
                    {},
                    excludePhotoKeys,
                    null
                )
                .skip(0)
                .limit(100)
                .populate('user', "firstName lastName");

    processList = [...preprocessedPhotoList];

    gallery.photos.imageList.push(
        ...processList
            .map((sourceData, index) => formatPhotoForFrontEndConsumption(sourceData, index, 0))
    );

    gallery.photos.pullCount = processList.length;

    return res
        .status(200)
        .json({
            data: gallery,
            fetchTS: markTimestamp(),
            fromCache: false
        });
});