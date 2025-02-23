import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = async (path, folder) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_USER,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const uploadData = await cloudinary.uploader.upload(path, { folder: folder });
        return { url: uploadData.secure_url, publicId: uploadData.public_id };
    } catch(err) {
        console.error(err);
        //throw err;
    }
}

export const removeFromCloudinary = async(publicId) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_USER,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch(err) {
        console.error(err);
        //throw err;
    }
}