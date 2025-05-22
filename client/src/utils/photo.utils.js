import {toast} from "react-toastify";
import {ZERO, ONE} from "../constants/frontend.constants";

// Util Functions
export const constructPhoto = (imgData, photoAltText, photoTitle, photoDescription, imgEXIFData, dimensions, customDownloadName, tags) => ({
    src: imgData,
    captions: {
        alt: photoAltText,
        description: photoDescription,
        title: photoTitle
    },
    dates: {
        photoTakenOn: imgEXIFData.dateTimeOriginal
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
    return `${splitBySpace[ZERO]} ${splitBySpace[ONE]}`;
};

export const getTripName = (photoList) => photoList[ZERO].tags[ONE];

export const changeDefaultPageSize = (val, setCurrentPage, setPageSizeOverride) => {
    setCurrentPage(ONE);
    return setPageSizeOverride(val);
};

// Component Actions
export const handlePhotoDelete = async (photoId, deletePhoto, navigate) => {
    try {
        const res = await deletePhoto({ photoId }).unwrap();
        if(res.statusCode === 202) {
            toast.success(res.message);
            return window.open(res.data.deleteUrl, '_blank');
        }
    } catch(err) {
        if(process.env.NODE_ENV === "development") console.error(err);
        if((err?.status >= 400 && err?.status < 500) && !!err?.data) {
            return toast.error(`${err?.status}: API Error - ${err?.data?.message}`);
        } else {
            return toast.error(`${err?.originalStatus || 500}: Network Error - ${err?.data.message || err?.status}`);
        }
    }
};

export const handlePhotoUpdate = (photoId, navigate) => {
    window.alert(`Update Photo! ${photoId}`);
    return navigate(`/photos/${photoId}`);
};

// Function to deduplicate deeply nested objects
export function deduplicateObjects(arr) {
    const seen = new Map();

    function recursiveDedup(obj) {
        // Handle null and primitives
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // Convert object to string for comparison
        const str = JSON.stringify(obj);

        // Check if we've seen this object before
        if (seen.has(str)) {
            return seen.get(str);
        }

        // For arrays, create new array and recurse on elements
        if (Array.isArray(obj)) {
            const newArr = obj.map(item => recursiveDedup(item));
            seen.set(str, newArr);
            return newArr;
        }

        // For objects, create new object and recurse on values
        const newObj = {};
        seen.set(str, newObj);

        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = recursiveDedup(value);
        }

        return newObj;
    }

    const uniqueStrs = [...new Set(arr.map(item => JSON.stringify(recursiveDedup(item))))];

    return uniqueStrs.map(str => JSON.parse(str));
}

export const mapPhotoData = (rtkData) => rtkData?.pages
    .flatMap(page => page.data.photos.imageList) || [];