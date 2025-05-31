import ApiVideoClient from '@api.video/nodejs-client';

const client = new ApiVideoClient({
    apiKey: process.env.API_VIDEO_API_KEY
});

export const uploadVideoToAPIVideo = async (file, videoCreationPayload) => {
    try {
        // Create Object in API Video For Uploading
        const apiVideoObj = await client.videos.create(videoCreationPayload);

        // Upload video file into the video container
        return await client.videos.upload(apiVideoObj.videoId, file, (event) => {
            console.log(`${file} - uploadedBytes: ` + event.uploadedBytes);
            console.log(`${file} - totalBytes: ` + event.totalBytes);
            console.log(`${file} - chunksCount: ` + event.chunksCount);
            console.log(`${file} - currentChunk: ` + event.currentChunk);
            console.log(`${file} - currentChunkTotalBytes: ` + event.currentChunkTotalBytes);
            console.log(`${file} - currentChunkUploadedBytes: ` + event.currentChunkUploadedBytes);
        });
    } catch(error) {
        console.error(error);
        return error;
    }
}