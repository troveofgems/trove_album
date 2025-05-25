import React from 'react';
import {InfiniteScrollShell} from "../../InfiniteScrollShell/InfiniteScrollShell";
import {getTripDate, getTripLocation, getTripName} from "../../../utils/photo.utils";
import {MasonryPhotoAlbumShell} from "../../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";

export const Gallery = ({
                            viewingGallery,
                            infinitePhotoData,
                            handleFetchMorePhotos,
                            handleOpenLightbox,
                            isLoading,
                            isFetching
                        }) => {

    if(viewingGallery === "Travel") {
        const travelPhotoGroups = processTravelPhotoGroups(infinitePhotoData);
        return TravelGallery(travelPhotoGroups, handleOpenLightbox);
    }

    return TopGallery(infinitePhotoData, handleFetchMorePhotos, handleOpenLightbox, isLoading, isFetching);
}

// For All Categories other than Travel
const TopGallery = (infinitePhotoData, handleFetchMorePhotos, handleOpenLightbox, isLoading, isFetching) => (
    <InfiniteScrollShell
        photos={infinitePhotoData}
        openLightbox={handleOpenLightbox}
        fetchMorePhotos={handleFetchMorePhotos}
        isLoading={isLoading}
        isFetching={isFetching}
    />
);

// Travel Specific Gallery View
const TravelGallery = (travelPhotoGroups, handleOpenLightbox) => (
    <div>
        {
            handleJSXForTravelPhotos(travelPhotoGroups, handleOpenLightbox)
        }
    </div>
);

const handleJSXForTravelPhotos = (travelPhotoGroups, handleOpenLightbox) => {
    let accumulatedInnerJsx = [];

    for (const [index, [strValLabel, arrayOfPhotos]] of travelPhotoGroups.entries()) {
        accumulatedInnerJsx.push(
            <div key={`${index}_travel`}>
                <h5 className={"text-white text-start mt-5 mb-2"}>{getTripName(arrayOfPhotos)}</h5>
                <h6 className={"text-white text-start mb-2 pb-2"}>{getTripDate(strValLabel)} - {getTripLocation(strValLabel)}</h6>
                <MasonryPhotoAlbumShell
                    photos={arrayOfPhotos}
                    openLightbox={handleOpenLightbox}
                    overrideRTKData={true}
                />
            </div>
        );
    }
    return (
        <div className="photo-gallery"  key={`full_travel_panel`}>
            {accumulatedInnerJsx}
        </div>
    );
};

const processTravelPhotoGroups = (response) => (
    new Map([
        ...response
            .pages
            .flatMap(page => Object.entries(page.data.photos.groupMap))
    ].entries())
);