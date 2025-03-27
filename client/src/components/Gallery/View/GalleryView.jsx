import React, {useEffect, useRef, useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "./GalleryView.css";

import { UNKNOWN_ERROR } from "../../../constants/frontend.constants";
import { useFetchGalleryQuery } from "../../../redux/slices/gallery.api.slice";
import {Loader} from "../../shared/Loader/Loader";
import {NoPhotosBlock} from "./NoPhotos/NoPhotos";
import {useLocation} from "react-router-dom";

import {AdvancedFiltering} from "../../../utils/filter.utils";
import {getTripDate, getTripLocation, getTripName} from "../../../utils/photo.utils";
import {LightBoxShell, openLightbox} from "../../LightboxShell/LightBoxShell";
import {MasonryPhotoAlbumShell} from "../../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {InfiniteScrollShell} from "../../InfiniteScrollShell/InfiniteScrollShell";

export const GalleryView = ({
    currentView: categoryRequested,
    initialPagination = {
        currentRound: 1,
        skip: 0,
        totalRounds: 0,
        limit: 10
    }
}) => {
    const
        { state: filterState } = useLocation(),
        [paginateData, setPaginateData] = useState(initialPagination),
        [galleryFromServer, setGalleryFromServer] = useState(null),
        [fullGallery, setFullGallery] = useState([]),
        [filteredGallery, setFilteredGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null),
        [filtersInUse, setFiltersInUse] = useState(false),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0);

    const { // Fetch Resources From Server
        data: photoGallery,
        isLoading: isLoadingGallery,
        error: galleryError,
        refetch: refetchGallery
    } = useFetchGalleryQuery(paginateData);

    const processGalleryView = (categoryToShow, filters) => {
        let
            filtersAreEmpty = filters === undefined || filters === null || filters === "",
            filteredGallery = [];

        if(filtersAreEmpty) {
            setFiltersInUse(false);
            let
                processAllItems = categoryToShow === "All Items",
                processTravel = categoryToShow === "Travel",
                processOtherCategories = !processAllItems && !processTravel;

            if(processAllItems) {
                filteredGallery = galleryFromServer;
            }

            if(processTravel) {
                const photoGroups = new Map();
                let travelPhotos = galleryFromServer.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
                travelPhotos.forEach((image) => {
                    const locationTime = `${image.tags[image.tags.length - 1]} ${image.tags[image.tags.length - 2]}`;

                    // Add image to the appropriate group
                    if (!photoGroups.has(locationTime)) {
                        photoGroups.set(locationTime, []);
                    }

                    photoGroups.get(locationTime).push(image);
                });
                setTravelPhotoGroups(photoGroups);
                filteredGallery = travelPhotos;
            }

            if(processOtherCategories) {
                filteredGallery = galleryFromServer.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
            }
        } else {
            setFiltersInUse(true);
            filteredGallery = AdvancedFiltering(filters, galleryFromServer);
        }

        // Finally Set The Data
        setFilteredGallery(filteredGallery);
        setGalleryTypeView(categoryToShow);
    };

    const // Lightbox Controls
        openLightbox = (evt) => {
            const photoIndex = fullGallery.findIndex(photo => photo.src === evt.target.src);
            setShowLightbox(true);
            setLightboxSpotlightIndex(photoIndex);
        };

    // 'Infinite' Photo Album ReFetch
    const fetchMorePhotos = async () => {
            const updatedParams = {
                ...paginateData,
                currentRound: paginateData.currentRound + 1,
                skip: paginateData.limit * (paginateData.currentRound),
                totalRounds: Math.ceil(photoGallery.data.photoCount / paginateData.limit)
            }

            // Don't Allow Repeated Calls to the Backend if We've Reached Total Photos To Return
            setPaginateData(updatedParams);
            if(updatedParams.currentRound > (updatedParams.totalRounds + 1)) return null;
            try {
                let morePhotos = await refetchGallery(updatedParams);
                if(morePhotos.status === "fulfilled") {
                    let ds = [...new Set([...galleryFromServer, ...morePhotos.data.data.fullGallery].map(JSON.stringify))].map(JSON.parse);
                    setGalleryFromServer(ds);
                    setFullGallery(ds);
                }
                return morePhotos.data.data.photos.data;
            } catch (error) {
                console.error("Failed to fetch more photos", error);
            }
            return null;
        };

    useEffect(() => {
        if(!isLoadingGallery && !!photoGallery) {
            if(galleryFromServer === null) {
                setGalleryFromServer(photoGallery.data.photos.data);
            } else {
                processGalleryView(categoryRequested, filterState?.query);
            }
        } else {
            console.log("Loading Gallery From Server...", new Date());
        }
    }, [categoryRequested, isLoadingGallery, galleryFromServer, filterState]);

    return (
        <>
            {galleryError && (
                <div className={"text-white mt-5"}>
                    <p>{galleryError?.data?.message || galleryError?.error || UNKNOWN_ERROR}</p>
                </div>
            )}
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
                        {fullGallery?.length === 0 && (
                            <NoPhotosBlock />
                        )}
                        {
                            (galleryTypeView === "All Items" && !filtersInUse) && (
                                <InfiniteScrollShell
                                    photos={fullGallery}
                                    openLightbox={openLightbox}
                                    fetchMorePhotos={fetchMorePhotos}
                                />
                            )
                        }
                        {
                            (galleryTypeView === "Travel" && !filtersInUse) && (
                                <>
                                    {[...travelPhotoGroups.entries()].map(([locationTime, subsetPhotoList], index) => (
                                        <div className={"mb-5 pb-5"} key={`${index}_travel`}>
                                            <h3 className={"text-white text-decoration-underline text-start mt-4"}>{getTripName(subsetPhotoList)}</h3>
                                            <h5 className={"text-white text-start"}>{getTripDate(locationTime)} - {getTripLocation(locationTime)}</h5>
                                            <MasonryPhotoAlbumShell
                                                photos={subsetPhotoList}
                                                openLightbox={openLightbox}
                                            />
                                        </div>
                                    ))}
                                </>
                            )
                        }
                        {
                            ((galleryTypeView !== "All Items" && galleryTypeView !== "Travel") || filtersInUse) && (
                                <>
                                    <MasonryPhotoAlbumShell
                                        photos={filteredGallery}
                                        openLightbox={openLightbox}
                                    />
                                </>
                            )
                        }
                        <LightBoxShell
                            slides={fullGallery}
                            lightboxSpotlightIndex={lightboxSpotlightIndex}
                            showLightbox={showLightbox}
                            setShowLightbox={setShowLightbox}
                        />
                    </>
                )
            }
            {isLoadingGallery && (<div className={"d-flex w-100 min-vh-100 justify-content-center"}><Loader /></div>)}
        </>
    )
}