export const filterPhotoAlbumFor = (filterType) => {
    console.log("Swap Album To: ", filterType);
};

export const constructPhoto = (imgData, photoAltText, photoTitle, photoDescription, imgEXIFData, dimensions, customDownloadName, tags) => ({
    src: imgData,
        alt: photoAltText,
        captions: {
        title: photoTitle,
            description: photoDescription
    },
    device: {
        make: imgEXIFData.make,
            model: imgEXIFData.model,
    },
    dimensions: {
        width: dimensions.width,
            height: dimensions.height,
            sizeInKB: dimensions.fileSizeInKB
    },
    download: {
        filename: customDownloadName
    },
    gps: {
        latitude: imgEXIFData.gpsLatitude,
            longitude: imgEXIFData.gpsLongitude,
            altitude: imgEXIFData.gpsAltitude,
    },
    photoTakenOn: imgEXIFData.dateTimeOriginal,
    tags
});