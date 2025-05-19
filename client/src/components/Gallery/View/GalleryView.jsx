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

const
    ZERO = 0,
    ONE = 1;

export const GalleryView = ({ currentView: categoryRequested }) => {
    const
        {state: filterState} = useLocation(),
        [rtkData, setRtkData] = useState(null),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(new Map()),
        [allResourcesLoaded, setAllResourcesLoaded] = useState(false),
        [noResourcesAvailable, setNoResourcesAvailable] = useState(true),
        [filtersInUse, setFiltersInUse] = useState(false),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxPhotos, setLightboxPhotos] = useState([]),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0),
        [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false); // TODO: Build Frontend Checkbox Control To Enable/Disable Infinite Scroller

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

    const handleServerDataUpdate = (result) => {
        console.log(infinitePhotoData.pages[infinitePhotoData.pages.length - ONE].data.photos.imageList);
        const lastFetch = infinitePhotoData.pages[infinitePhotoData.pages.length - ONE].data.photos;
        if (result.status === "fulfilled") return lastFetch.imageList;
    };

    const handleResourceMessages = (oldData, newData) => {
        const lastPageInfo = getLastPageInfo(oldData, newData);
        console.log("Handle Resource Messages: ", lastPageInfo);

        if(lastPageInfo.initialPageLoad) {
            setNoResourcesAvailable(lastPageInfo.noResourcesAvailable);
            setAllResourcesLoaded(lastPageInfo.noFurtherResourcesToLoadFromServer);
        } else {
            setNoResourcesAvailable(lastPageInfo.noResourcesAvailable);
            setAllResourcesLoaded(lastPageInfo.noFurtherResourcesToLoadFromServer && !lastPageInfo.noResourcesAvailable);
        }
    };

    const getLastPageInfo = (oldData, newData) => {
        const
            initialPageLoad = !oldData && !!newData,
            lastPage = newData.pages.length - ONE,
            lastResponse = infinitePhotoData.pages[infinitePhotoData.pages.length - ONE],
            lastResponseParams = infinitePhotoData.pageParams[infinitePhotoData.pageParams.length - ONE],
            lastPageReached =
                lastResponseParams.page === (lastResponse.data.photos.pagination.maxPages) ||
                lastResponseParams.page > (lastResponse.data.photos.pagination.maxPages);

        const
            noResourcesAvailable =
                newData.pages[lastPage].data.photos.totalPhotoCount === ZERO &&
                newData.pages[lastPage].data.photos.pullCount === ZERO &&
                newData.pages[lastPage].data.photos.imageList.length === ZERO,
            noFurtherResourcesToLoadFromServer =
                lastPageReached &&
                newData.pages[lastPage].data.photos.totalPhotoCount ===
                newData.pages[lastPage].data.photos.imageList.length;

        return {
            initialPageLoad,
            lastPageReached,
            noResourcesAvailable,
            noFurtherResourcesToLoadFromServer
        };
    };

    const // Lightbox Controls
        handleOpenLightbox = (evt) => {
            const
                photoList = flatMapPhotos(infinitePhotoData),
                photoIndex = photoList.findIndex(photo => photo.src === evt.target.src);

            const photos = infinitePhotoData.pages.flatMap(page =>
                page.data.photos.imageList.map(photo => ({
                    src: photo.provider.url,
                    width: photo.width || 1200,
                    height: photo.height || 800,
                    title: photo.title,
                    description: photo.description,
                    download: { ...photo.download }
                }))
            );

            setLightboxPhotos(photos);
            setShowLightbox(true);
            setLightboxSpotlightIndex(photoIndex);
        };

    const handleFetchMorePhotos = async () => {
        console.log("Inside HandleFetchMorePhotos");
        let
            useInfiniteScroll = enableInfiniteScroll || false,
            lastResponse = infinitePhotoData.pages[infinitePhotoData.pages.length - ONE],
            lastResponseParams = infinitePhotoData.pageParams[infinitePhotoData.pageParams.length - ONE],
            lastPageReached =
                lastResponseParams.page === (lastResponse.data.photos.pagination.maxPages) ||
                lastResponseParams.page > (lastResponse.data.photos.pagination.maxPages);

        console.log("Use Infinite Scroll: ", useInfiniteScroll);
        console.log("Last Response: ", lastResponse);
        console.log("Last Response Params: ", lastResponseParams);
        console.log("Last Page Reached: ", lastPageReached);

        let allowCallToProceed = (
            (!lastPageReached) ||
            lastResponseParams.page < (lastResponse.data.photos.pagination.maxPages) ||
            useInfiniteScroll
        );

        console.log("Allow Call To Proceed: ", allowCallToProceed);

        if (!allowCallToProceed) return null;

        let enableInfinitePhotoScroll = (
            lastResponseParams.page <= (lastResponse.data.photos.pagination.maxPages + ONE)
        );

        try {
            const morePhotos = await fetchNextPage();
            return handleServerDataUpdate(morePhotos, lastPageReached);
        } catch (err) {
            console.warn("Error Fetching More Photos: ", err);
        }
        return null;
    };
    const flatMapPhotos = (photoData) => photoData?.pages
            .flatMap(page => page.data.photos.imageList) || [];

    const handleJSXForTravelPhotos = () => {
        let innerJsx = [];

        for (const [index, [strValLabel, arrayOfPhotos]] of travelPhotoGroups.entries()) {
            innerJsx.push(
                <div key={`${index}_travel`}>
                    <h5 className={"text-white text-start mt-5 mb-2"}>{getTripName(arrayOfPhotos)}</h5>
                    <h6 className={"text-white text-start mb-2 pb-2"}>{getTripDate(strValLabel)} - {getTripLocation(strValLabel)}</h6>
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
        const
            makeUpdateToRtkState = shouldUpdate(rtkData, infinitePhotoData),
            processTravelPhotosIntoMapGroups =
                (rtkData?.pageParams[rtkData?.pageParams.length - 1].filters?.category === "Travel") || false;

        console.log("Make an Update: ", makeUpdateToRtkState, infinitePhotoData, rtkData);

        if(makeUpdateToRtkState) {
            setRtkData(infinitePhotoData);
            handleResourceMessages(rtkData, infinitePhotoData);
        }
        if(processTravelPhotosIntoMapGroups) processTravelPhotoGroups();
    };

    useEffect(() => {
        if(infinitePhotoData !== undefined) return handleUpdatesToState();
    }, [infinitePhotoData, rtkData]);

    // TODO: Move To Util File
    const shouldUpdate = (prevData, newData) => {
        console.log("Should Update: ", prevData, newData);
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
                                    photos={flatMapPhotos(infinitePhotoData)}
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
                                            photos={flatMapPhotos(infinitePhotoData)}
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
                            slides={lightboxPhotos}
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