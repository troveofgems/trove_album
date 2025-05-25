import React, {useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import {useFetchPhotosInfiniteQuery} from "../../redux/slices/gallery.api.slice";
import {mapPhotoData} from "../../utils/photo.utils";
import {LightBoxShell} from "../LightboxShell/LightBoxShell";
import {CacheStatusLabelWrapper} from "../CacheStatusLabelWrapper/CacheStatusLabelWrapper";
import {Loader} from "../shared/Loader/Loader";
import {Gallery} from "./Views/Gallery";

import "./Album.css";

const
    ZERO = 0,
    ONE = 1;

export const Album = ({ viewingGallery, filters }) => {
    const
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

    const // TODO: Make Update To This and Encapsulate/Sync with Backend Cache Redis.
        fetchSettingCacheLabel = viewingGallery === "All Items" &&
        (filters === null || filters === "") ? viewingGallery :
            !!filters && filters !== "" ? `${viewingGallery}_filteringEnabled_${filters.query}` :
                viewingGallery;

    const {
        data: infinitePhotoData, error,
        fetchNextPage,
        isLoading, isFetching
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

    return (
        <div className={"text-start"}>
            <div id={"galleryBanner"} className={"d-flex"}>
                <h2 className={"text-white mt-5 mb-5"}>
                    {viewingGallery === "All Items" ? "Full " : viewingGallery} Gallery
                </h2>
                <CacheStatusLabelWrapper
                    infinitePhotoData={infinitePhotoData}
                    error={error}
                    isLoading={isLoading}
                    isFetching={isFetching}
                />
            </div>
            {
                (isLoading || !infinitePhotoData || isFetching) ?
                    <Loader /> :
                    <>
                        <Gallery
                            viewingGallery={viewingGallery}
                            infinitePhotoData={infinitePhotoData}
                            handleFetchMorePhotos={handleFetchMorePhotos}
                            handleOpenLightbox={handleOpenLightbox}
                            isLoading={isLoading}
                            isFetching={isFetching}
                        />
                        <LightBoxShell
                            slides={lightboxPhotos}
                            lightboxSpotlightIndex={lightboxSpotlightIndex}
                            showLightbox={showLightbox}
                            setShowLightbox={setShowLightbox}
                        />
                    </>
            }
        </div>
    )
}