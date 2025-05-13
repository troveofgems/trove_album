import { imgbbUpload } from "imgbb-image-uploader";
import PhotoModel from "../db/models/photo.model.js";

export const uploadToImgBB = async (srcData, albumId, photo, mongoDBResourceId) => {
    const options = {
        key: process.env.IMG_BB_API_KEY,
        image: srcData.replace(/^data:image\/[a-zA-Z]+;base64,/i, ""),
    };

    try {
        let response = await imgbbUpload(options);

        // Set Photo Display & Delete Urls
        photo.setProviderDisplayUrl(response.data.display_url);
        photo.setProviderDeleteUrl(response.data.delete_url);

        // Set Photo SrcSet Data
        let srcSet = [
            {
                src: response.data.image.url,
                width: response.data.width,
                height: response.data.height
            },
            {
                src: response.data.thumb.url,
                width: 180,
                height: 180
            }
        ];

        if(!!response.data?.medium) { // Medium Property Does Not Exist For Certain Photo Types
            srcSet.push({
                src: response.data.medium.url,
                width: 640,
                height: 960
            });
        }

        photo.setPhotoSrcSet(srcSet);

        await PhotoModel.findByIdAndUpdate(
            mongoDBResourceId,
            {
                provider: {
                    url: response.data.display_url,
                    deleteUrl: response.data.delete_url,
                    status: 'completed'
                },
                srcSet: srcSet
            },
        )

        return photo;
    } catch (error) {
        console.error('Error uploading image:', error.message);
        throw error;
    }
};

export const removeFromImgBB = async(publicId) => {

};
