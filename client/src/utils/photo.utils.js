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
export const getTripLocation = (loc) => {
    const splitBySpace = loc.split(" ");

    let tripName = "";

    if(splitBySpace.length === 4) {
        tripName = `${splitBySpace[2]} ${splitBySpace[3]}`;
    } else if (splitBySpace.length === 5) {
        tripName = `${splitBySpace[2]} ${splitBySpace[3]} ${splitBySpace[4]}`;
    } // Not sure if this will get larger...Need a better way to handle this.

    return tripName;
};
export const getTripDate = (loc) => {
    const splitBySpace = loc.split(" ");
    return `${splitBySpace[0]} ${splitBySpace[1]}`;
};
export const getTripName = (photoList) => photoList[0].tags[1];
