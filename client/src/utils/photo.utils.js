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
    const continueWithDelete = window.prompt(`To delete the resource please type in the id: ${photoId}`);
    if(continueWithDelete === photoId) {
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
    } else {
        let
            actionCancelled = continueWithDelete === null,
            idMismatch = continueWithDelete !== null && continueWithDelete !== photoId,
            message = "Photo Not Removed!";

        if(actionCancelled) message += " Action Cancelled";
        if(idMismatch) message += " ID Mismatch";

        return toast.error(message);
    }
};

export const handlePhotoUpdate = (photoId, navigate) => navigate(`/photos/${photoId}`);

export const mapPhotoData = (rtkData) => {
    console.log("Inside Map Photo Data: ", rtkData);
    if(!!rtkData) {
        return rtkData?.pages?.flatMap(page => page.data.photos.imageList);
    }
    console.log("Inside Map Photo Data but No rtkData...", rtkData, "Returning []");
    return [];
};
