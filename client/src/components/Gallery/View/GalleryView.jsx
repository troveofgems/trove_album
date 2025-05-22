import React, {useEffect, useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "./GalleryView.css";

import {UNKNOWN_ERROR} from "../../../constants/frontend.constants";
import {useFetchPhotosInfiniteQuery} from "../../../redux/slices/gallery.api.slice";
import {Loader} from "../../shared/Loader/Loader";
import {NoPhotosBlock} from "./NoPhotos/NoPhotos";
import {getTripDate, getTripLocation, getTripName, mapPhotoData} from "../../../utils/photo.utils";
import {LightBoxShell} from "../../LightboxShell/LightBoxShell";
import {MasonryPhotoAlbumShell} from "../../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {InfiniteScrollShell} from "../../InfiniteScrollShell/InfiniteScrollShell";

const
    ZERO = 0,
    ONE = 1;

export const GalleryView = ({ viewingGallery, filters }) => {
    const
        [travelPhotoGroups, setTravelPhotoGroups] = useState(new Map()),
        [allResourcesLoaded, setAllResourcesLoaded] = useState(false),
        [noResourcesAvailable, setNoResourcesAvailable] = useState(true),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxPhotos, setLightboxPhotos] = useState([]),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0),
        [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false); // TODO: Build Frontend Checkbox Control To Enable/Disable Infinite Scroller

    const handleServerDataUpdate = (result) => {
        const lastFetch = infinitePhotoData.pages[infinitePhotoData.pages.length - ONE].data.photos;
        if (result.status === "fulfilled") return lastFetch.imageList;
    };

    const // Lightbox Controls
        handleOpenLightbox = (evt) => {
            const
                photoList = mapPhotoData(infinitePhotoData),
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
        let
            useInfiniteScroll = enableInfiniteScroll || false,
            lastResponse = infinitePhotoData.pages[infinitePhotoData.pages.length - ONE],
            lastResponseParams = infinitePhotoData.pageParams[infinitePhotoData.pageParams.length - ONE],
            lastPageReached =
                lastResponseParams.page === (lastResponse.data.photos.pagination.maxPages) ||
                lastResponseParams.page > (lastResponse.data.photos.pagination.maxPages);

        let allowCallToProceed = (
            (!lastPageReached) ||
            lastResponseParams.page < (lastResponse.data.photos.pagination.maxPages) ||
            useInfiniteScroll
        );

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

    const handleJSXForTravelPhotos = () => {
        let innerJsx = [];

        for (const [index, [strValLabel, arrayOfPhotos]] of travelPhotoGroups.entries()) {
            console.log("Array Of Photos: ", arrayOfPhotos);
            innerJsx.push(
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
                {innerJsx}
            </div>
        );
    };
    const processTravelPhotoGroups = (response) => {
        const groupedPhotos = new Map([
            ...response
                .data
                .pages
                .flatMap(page => Object.entries(page.data.photos.groupMap))
        ].entries());

        setTravelPhotoGroups(groupedPhotos);
    };

    const
        fetchSettingCacheLabel = viewingGallery === "All Items" &&
        (filters === null || filters === "") ? viewingGallery :
            !!filters && filters !== "" ? `${viewingGallery}_filteringEnabled_${filters.query}` :
                viewingGallery;

    const handleResourceMessages = (response) => {
        if(response.status === "fulfilled") {
            const {
                fetchQuotaReached = false,
                imageList
            } = response.data.pages[response.data.pages.length - 1].data.photos;

            const
                allItemsLoaded = fetchQuotaReached && imageList.length > 0,
                noItemsLoaded = fetchQuotaReached && imageList.length === 0,
                someItemsLoaded = !fetchQuotaReached && imageList.length > 0;

            // Hides or Shows Resource Messages in Component
            if(allItemsLoaded) {
                setAllResourcesLoaded(true);
                setNoResourcesAvailable(false);
            } else if (noItemsLoaded) {
                setAllResourcesLoaded(false);
                setNoResourcesAvailable(true);
            } else if (someItemsLoaded) {
                setAllResourcesLoaded(false);
                setNoResourcesAvailable(false);
            }
        } else {
            console.log("Handle Rogue Status: ", response.status);
            console.log("Rejected: ", response);
            // Show the Error Message Instead...
        }
    };

    const {
        data: infinitePhotoData, error,
        isLoading, isFetching,
        fetchNextPage,
        refetch
    } = useFetchPhotosInfiniteQuery(
        fetchSettingCacheLabel,
        {
            initialPageParam: {
                offset: 0,
                limit: 10,
                page: 1,
                maxPages: 1,
                settings: {
                    filters: {
                        enabled: viewingGallery !== "All Items",
                        enabledWithStrFilter: (filters !== null && filters?.query !== ""),
                        category: viewingGallery === "All Items" ? "*" : viewingGallery,
                        userInputStr: filters?.query || "",
                        by: {
                            exact: {
                                flagged: false,
                                terms: []
                            },
                            exclusion: {
                                flagged: false,
                                terms: []
                            },
                            fuzzy: {
                                flagged: false,
                                terms: []
                            },
                            websiteOnly: {
                                flagged: false,
                                terms: []
                            },
                            allSites: {
                                flagged: false,
                                terms: []
                            },
                            numberRange: {
                                flagged: false,
                                ranges: {
                                    beforeDates: [],
                                    afterDates: []
                                }
                            },
                            filetype: {
                                flagged: false,
                                terms: []
                            }
                        }
                    }
                }
            }
        }
    );

    // Handles All Category and Filter Changes
    useEffect(() => {
        refetch()
            .then((refetchResponse) =>
                fetchNextPage()
                    .then((fetchNextPageResponse) => {
                        handleResourceMessages(fetchNextPageResponse);
                        const isTravelCategory =
                            fetchNextPageResponse.data.pages[fetchNextPageResponse.data.pages.length - 1]
                                .data
                                .UIFetchSettings
                                .settings
                                .filters
                                .category === "Travel";

                        if(isTravelCategory) processTravelPhotoGroups(fetchNextPageResponse);
                    })
            );
    }, [filters, viewingGallery]);

    return (
        <div className={"text-start"}>
            <h2 className={"text-white mt-5 mb-5"}>
                {viewingGallery === "All Items" ? "Full " : viewingGallery} Gallery
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
                            viewingGallery !== "Travel" && (
                                <InfiniteScrollShell
                                    photos={infinitePhotoData}
                                    openLightbox={handleOpenLightbox}
                                    fetchMorePhotos={handleFetchMorePhotos}
                                />
                            )
                        }
                        {
                            viewingGallery === "Travel" &&
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