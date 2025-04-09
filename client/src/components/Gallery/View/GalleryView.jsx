import React, {useEffect, useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "./GalleryView.css";

import { UNKNOWN_ERROR } from "../../../constants/frontend.constants";
import {useFetchPhotosInfiniteQuery} from "../../../redux/slices/gallery.api.slice";
import {Loader} from "../../shared/Loader/Loader";
import {NoPhotosBlock} from "./NoPhotos/NoPhotos";
import {useLocation} from "react-router-dom";
import {getTripDate, getTripLocation, getTripName} from "../../../utils/photo.utils";
import {LightBoxShell} from "../../LightboxShell/LightBoxShell";
import {MasonryPhotoAlbumShell} from "../../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {InfiniteScrollShell} from "../../InfiniteScrollShell/InfiniteScrollShell";
import {setFiltersObjectForFrontend} from "../../../types/filters.type";

export const GalleryView = ({ currentView: categoryRequested }) => {
    const
        {state: filterState} = useLocation(),
        [rtkData, setRtkData] = useState(null),
        [gallery, setGallery] = useState([]),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(new Map()),
        [allResourcesLoaded, setAllResourcesLoaded] = useState(false),
        [noResourcesAvailable, setNoResourcesAvailable] = useState(true),
        [filtersInUse, setFiltersInUse] = useState(false),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0),
        [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);

    const {
        data: infinitePhotoData, error,
        isLoading, isFetching,
        fetchNextPage
    } = useFetchPhotosInfiniteQuery(`${categoryRequested}`, {
        initialPageParam: {
            offset: 0,
            limit: 10,
            page: 1,
            maxPages: 1,
            filters: {
                ...setFiltersObjectForFrontend(categoryRequested, filterState),
                category: categoryRequested === "All Items" ? "*" : categoryRequested,
            }
        }
    });

    const
        handleNoResourcesAvailable = (trackingList) => trackingList.length === 0,
        handleAllResourcesLoaded = (lastPageReached, galleryItems, lastFetch) => lastPageReached && (galleryItems.length === lastFetch.totalPhotoCount),
        handleCallToTravelPhotoGroups = (filterCategory) => filterCategory === "Travel";

    const handleServerDataUpdate = (result, lastPageReached) => {
        const
            lastFetch = infinitePhotoData.pages[infinitePhotoData.pages.length - 1].data.photos,
            galleryItems = infinitePhotoData.pages.flatMap(page => page.data.photos.imageList);

        // Update No Resources State
        setNoResourcesAvailable(handleNoResourcesAvailable(gallery));

        // Update All Resources Loaded State
        setAllResourcesLoaded(handleAllResourcesLoaded(lastPageReached, galleryItems, lastFetch));

        if (result.status === "fulfilled") {
            let galleryViewUpdate = lastFetch.imageList;
            setGallery(galleryItems);
            return galleryViewUpdate;
        }
    }

    const // Lightbox Controls
        handleOpenLightbox = (evt) => {
            const
                photoList = flatMapPhotos(),
                photoIndex = photoList.findIndex(photo => photo.src === evt.target.src);
            setShowLightbox(true);
            setLightboxSpotlightIndex(photoIndex);
        };

    const handleFetchMorePhotos = async () => {
        let
            useInfiniteScroll = enableInfiniteScroll || false,
            lastResponse = infinitePhotoData.pages[infinitePhotoData.pages.length - 1],
            lastResponseParams = infinitePhotoData.pageParams[infinitePhotoData.pageParams.length - 1],
            lastPageReached =
                lastResponseParams.page === (lastResponse.data.photos.pagination.maxPages) ||
                lastResponseParams.page > (lastResponse.data.photos.pagination.maxPages);

        let allowCallToProceed = (
            (lastPageReached && !allResourcesLoaded) ||
            lastResponseParams.page < (lastResponse.data.photos.pagination.maxPages) ||
            useInfiniteScroll
        );

        if (!allowCallToProceed) return null;

        let enableInfinitePhotoScroll = (
            lastResponseParams.page <= (lastResponse.data.photos.pagination.maxPages + 1)
        );

        try {
            const morePhotos = await fetchNextPage();
            return handleServerDataUpdate(morePhotos, lastPageReached);
        } catch (err) {
            console.warn("Error Fetching More Photos: ", err);
        }
        return null;
    };
    const flatMapPhotos = () => rtkData?.pages.flatMap(page => page.data.photos.imageList) || [];

    const handleJSXForTravelPhotos = () => {
        let innerJsx = [];

        for (const [index, [strValLabel, arrayOfPhotos]] of travelPhotoGroups.entries()) {
            console.log(`Index: ${index}`);
            console.log(`Label: ${strValLabel}`);
            console.log(`Photos:`, arrayOfPhotos);
            innerJsx.push(
                <div key={`${index}_travel`}>
                    <h5 className={"text-white text-start mt-5 mb-3"}>{strValLabel}</h5>
                    <MasonryPhotoAlbumShell
                        photos={arrayOfPhotos}
                        openLightbox={handleOpenLightbox}
                    />
                </div>
            );
        }

        return (
            <div className="photo-gallery"  key={`full_travel_panel`}>
                {innerJsx}
            </div>
        );
        /*[...spreadPhotos.map(([locationTime, subsetPhotoList], index) => (
            <div className={"mb-5 pb-5 text-white"}>
{getTripDate(strValLabel)} - {getTripLocation(strValLabel)}
               {<MasonryPhotoAlbumShell
                    photos={subsetPhotoList}
                    openLightbox={handleOpenLightbox}
                />}
            </div>
        ))]*/
    };
    const handleFetchTravelPhotos = () => {
        console.log("Fetch Travel Photos Here...");
        return null;
    };
    const processTravelPhotoGroups = () => {
        console.log("handleTravelPhotoGroups ", rtkData.pages);

        const groupedPhotos = new Map([
                ...rtkData
                    .pages
                    .flatMap(page => Object.entries(page.data.photos.groupMap))
            ].entries());

        console.log("handleTravelPhotoGroups - Grouped Photos? ", groupedPhotos, travelPhotoGroups);

        setTravelPhotoGroups(groupedPhotos);
        return null;
    };

    const handleUpdatesToState = () => {
        console.log("Inside handleUpdateToIDP handle Change: ", infinitePhotoData, rtkData);
        const makeUpdateToRtkState = shouldUpdate(rtkData, infinitePhotoData),
            processTravelPhotosIntoMapGroups = (rtkData?.pageParams[rtkData?.pageParams.length - 1].filters?.category === "Travel") || false;

        if(makeUpdateToRtkState) setRtkData(infinitePhotoData);
        if(processTravelPhotosIntoMapGroups) processTravelPhotoGroups();

        console.log("Inside handleUpdateToIDP RTK State Updated: ", makeUpdateToRtkState, rtkData);
    };

    useEffect(() => {
        if(infinitePhotoData !== undefined) return handleUpdatesToState();
    }, [infinitePhotoData, rtkData]);


    const shouldUpdate = (prevData, newData) => {
        // Quick reference check first
        if (prevData === newData) return false;

        // Check if both are objects
        if (!prevData || !newData ||
            typeof prevData !== 'object' ||
            typeof newData !== 'object') {
                return prevData !== newData;
        }

        // Compare keys and values at top level
        const prevKeys = Object.keys(prevData);
        const newKeys = Object.keys(newData);

        if (prevKeys.length !== newKeys.length) return true;

        return prevKeys.some(key => {
            if (!newData.hasOwnProperty(key)) return true;
            if (typeof prevData[key] === 'object') {
                // Handle nested objects separately
                return prevData[key] !== newData[key]; // Reference check for nested
            }
            return prevData[key] !== newData[key];
        });
    };

    return (
        <div className={"text-start"}>
            <h2 className={"text-white mt-5 mb-5"}>
                {categoryRequested === "All Items" ? "Full " : categoryRequested} Gallery
            </h2>
            {
                (!!infinitePhotoData) ? (
                    <>
                        {noResourcesAvailable && (
                            <div className={"mt-5 mb-5 text-center"}>
                                <NoPhotosBlock />
                            </div>
                        )}
                        {
                            categoryRequested === "All Items" && (
                                <InfiniteScrollShell
                                    photos={[]}
                                    openLightbox={handleOpenLightbox}
                                    fetchMorePhotos={handleFetchMorePhotos}
                                />
                            )
                        }
                        {
                            categoryRequested === "Travel" &&
                            travelPhotoGroups !== undefined &&
                            travelPhotoGroups !== null && (
                                <div>
                                    {
                                        (!!travelPhotoGroups && travelPhotoGroups.size > 0) &&
                                        handleJSXForTravelPhotos()
                                    }
                                </div>
                            )
                        }
                        {
                            categoryRequested !== "All Items" &&
                            categoryRequested !== "Travel" && (
                                <>
                                    {
                                        <MasonryPhotoAlbumShell
                                            photos={flatMapPhotos()}
                                            openLightbox={handleOpenLightbox}
                                        />
                                    }
                                </>
                            )
                        }
                        {
                            (isLoading || isFetching) && <Loader />
                        }
                        {allResourcesLoaded && (
                            <div className={"mt-5 mb-5 pb-5 text-center"}>
                                <h4 className={"text-white"}>All Resources Have Been Loaded! ☺️</h4>
                            </div>
                        )}
                        <LightBoxShell
                            slides={flatMapPhotos()}
                            lightboxSpotlightIndex={lightboxSpotlightIndex}
                            showLightbox={showLightbox}
                            setShowLightbox={setShowLightbox}
                        />
                    </>
                ) : (<Loader />)
            }
            {!!error && (
                <div className={"text-center text-white mt-5"}>
                    <h4>{error?.data?.message || error?.error || UNKNOWN_ERROR}</h4>
                </div>
            )}
        </div>
    )
}