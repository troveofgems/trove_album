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
        [gallery, setGallery] = useState([]),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(new Map()),
        [allResourcesLoaded, setAllResourcesLoaded] = useState(false),
        [noResourcesAvailable, setNoResourcesAvailable] = useState(true),
        [filtersInUse, setFiltersInUse] = useState(false),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0);

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

    const handleServerDataUpdate = (result, lastPageReached) => {
        if (result.status === "fulfilled") {
            let galleryViewUpdate = infinitePhotoData.pages[infinitePhotoData.pages.length - 1].data.photos.imageList;

            console.log("Process For Travel? ", infinitePhotoData.filters.category === "Travel");

            /*if(infinitePhotoData.filters.category === "Travel") {
                console.log("Process Travel Category!");
                const map = ;
                console.log("Travel: ", infinitePhotoData.pages.data.photos.groupMap);
                setTravelPhotoGroups(map);
                console.log("Set Travel Photo Groups To: ", map, travelPhotoGroups);
            }*/

            if (lastPageReached) setAllResourcesLoaded(true);
            let galleryUpdate = infinitePhotoData.pages.flatMap(page => page.data.photos.imageList);
            setGallery(galleryUpdate);
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
            useInfiniteScroll = false,
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
    const flatMapPhotos = () => infinitePhotoData.pages.flatMap(page => page.data.photos.imageList);

    const handleTravelPhotoGroups = () => {
        const groupedPhotos = [
            ...new Map([
                ...infinitePhotoData
                    .pages
                    .flatMap(page => Object.entries(page.data.photos.groupMap))
            ].entries())];

        console.log("Grouped Photos? ", groupedPhotos);

        return [
            ...new Map(Object.entries(infinitePhotoData.pages[infinitePhotoData.pages.length - 1].data.photos.groupMap)).entries()
        ].map(([locationTime, subsetPhotoList], index) => (
            <div className={"mb-5 pb-5"} key={`${index}_travel`}>
                <h3 className={"text-white text-decoration-underline text-start mt-4"}>{getTripName(subsetPhotoList)}</h3>
                <h5 className={"text-white text-start"}>{getTripDate(locationTime)} - {getTripLocation(locationTime)}</h5>
                <MasonryPhotoAlbumShell
                    photos={subsetPhotoList}
                    openLightbox={handleOpenLightbox}
                />
            </div>
        ))
    }

    return (
        <>
            {(isLoading || isFetching) && (
                <Loader />
            )}
            {!!error && (
                <div className={"text-white mt-5"}>
                    <p>{error?.data?.message || error?.error || UNKNOWN_ERROR}</p>
                </div>
            )}
            {
                ((!isLoading || !isFetching) && !!infinitePhotoData) && (
                    <>
                        <div className={"text-start text-white"}>
                            <h2 className={"text-white mt-5 mb-5"}>Viewing: {categoryRequested === "All Items" ? "Full Gallery" : categoryRequested}</h2>
                            {noResourcesAvailable && (
                                <div className={"mt-5 mb-5 text-center"}>
                                    <NoPhotosBlock />
                                </div>
                            )}
                            {
                                categoryRequested === "All Items" && (
                                    <>
                                        {
                                            <InfiniteScrollShell
                                                photos={gallery}
                                                openLightbox={handleOpenLightbox}
                                                fetchMorePhotos={handleFetchMorePhotos}
                                            />
                                        }
                                    </>
                                )
                            }
                            {
                                categoryRequested === "Travel" &&
                                travelPhotoGroups !== undefined &&
                                travelPhotoGroups !== null && (
                                    <>
                                        {handleTravelPhotoGroups()}
                                    </>
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
                            <LightBoxShell
                                slides={flatMapPhotos()}
                                lightboxSpotlightIndex={lightboxSpotlightIndex}
                                showLightbox={showLightbox}
                                setShowLightbox={setShowLightbox}
                            />
                        </div>
                        {allResourcesLoaded && (
                            <div className={"mt-5 mb-5 pb-5"}>
                                <h4 className={"text-white"}>All Resources Loaded! ☺️</h4>
                            </div>
                        )}
                    </>
                )
            }
        </>
        /*<>

        infinitePhotoData.pages.flatMap(page => page.data.photos.imageList)

            {
                !isLoadingGallery && (
                    <>
                        <div className={"text-start mb-4"}>
                            <h2 className={"text-white mt-5"}>Viewing: {categoryRequested === "All Items" ? "Full Gallery" : categoryRequested}</h2>
                            {
                                filtersInUse && (
                                    <>
                                        <h4 className={"text-white"}>Filters: {filterState?.query}</h4>
                                    </>
                                )
                            }
                        </div>

                        {
                            (galleryTypeView === "All Items" && !filtersInUse) && (
                                <InfiniteScrollShell
                                photos={fullGallery}
                                openLightbox={openLightbox}
                                fetchMorePhotos={() => {}}
                            />
                            )
                        }


                    </>
                )
            }
        </>*/
    )
}