import React, {useEffect, useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import { MasonryPhotoAlbum } from "react-photo-album";
import { UnstableInfiniteScroll as InfiniteScroll } from "react-photo-album/scroll";

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
//import Share from "yet-another-react-lightbox/plugins/share"; // Broken

import { UNKNOWN_ERROR } from "../../../constants/frontend.constants";
import { useFetchGalleryQuery } from "../../../redux/slices/gallery.api.slice";
import {Loader} from "../../shared/Loader/Loader";
import {NoPhotosBlock} from "./NoPhotos/NoPhotos";
import {useLocation, useParams} from "react-router-dom";

export const GalleryView = ({ currentView: categoryRequested, setIsHovering }) => {
    const
        { state: filterState } = useLocation(),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        [gallery, setGallery] = useState([]),
        [filteredGallery, setFilteredGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [filtersInUse, setFiltersInUse] = useState(false),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null);

    const processGalleryView = (categoryToShow, fullGallery, filters) => {
        let
            filteredCategoryView = [],
            showAllItems = categoryToShow === "All Items";

        if(showAllItems) {
            filteredCategoryView = fullGallery;
        } else {
            filteredCategoryView = fullGallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
        }

        if(categoryToShow === "Travel") {
            // Set New Structure for Travel Photos based off tags:
            filteredCategoryView.map(item => console.log(item.tags));
            const photoGroups = new Map();

            // Process each image
            filteredCategoryView.forEach(image => {
                const locationTime = `${image.tags[image.tags.length - 1]} ${image.tags[image.tags.length - 2]}`;

                console.log("Location Time: ", locationTime);

                // Add image to the appropriate group
                if (!photoGroups.has(locationTime)) {
                    photoGroups.set(locationTime, []);
                }
                photoGroups.get(locationTime).push(image);
            });
            setTravelPhotoGroups(photoGroups);
        }

        if(!!filters && filters.length > 0) {
            const
                lowercasedFilters = filters.toLowerCase(),
                filterByExact = (
                    typeof lowercasedFilters === 'string' &&
                    lowercasedFilters.length > 0 &&
                    (lowercasedFilters.includes("\"") || lowercasedFilters.includes("\'"))
                ),
                filterByExclusion = lowercasedFilters.includes("-"),
                filterByFuzzy = lowercasedFilters.includes("~"),
                filterByWebsiteOnly = lowercasedFilters.includes("site:"),
                filterByAllSites = lowercasedFilters.includes("|"),
                filterByNumberRange = lowercasedFilters.includes(".."),
                filterByFileType = lowercasedFilters.includes("filetype:");

            console.log("Lower ", lowercasedFilters);
            setFiltersInUse(true);

            if(filterByExact) {
                let
                    filter = lowercasedFilters.replace(/'/g, "");
                filter = filter.replace(/"/g, "");

                console.log("Use the photo gallery returned from the server: ", photoGallery);
                console.log("Filtering By: ", filter);
                filteredCategoryView = filteredCategoryView.filter((photo) => photo.title.toLowerCase().includes(filter));
                console.log("Filtered DS: ", filteredCategoryView);
            }
        }

        console.log("Filtered Category View? ", filteredCategoryView);
        setGalleryTypeView(categoryToShow);
        setGallery(filteredCategoryView);
        setFilteredGallery(filteredCategoryView);
    };

    const adjustBoxSizing = (containerWidth) => {
        if (containerWidth < 400) return 1;
        if (containerWidth < 800) return 3;
        if (containerWidth < 1200) return 5;
        return 7;
    }

    useEffect(() => {
        if(!isLoadingGallery && photoGallery) {
            setGallery(photoGallery.data.fullGallery);
            processGalleryView(categoryRequested, photoGallery.data.fullGallery, filterState?.query);
        }
    }, [categoryRequested, photoGallery, filterState]);

    const // Lightbox Controls
        photoCaptionsRefForLightbox = React.useRef(null),
        [showLightbox, setShowLightbox] = useState(false),
        [lightboxSpotlightIndex, setLightboxSpotlightIndex] = useState(0),
        openLightbox = (index) => {
            setShowLightbox(true);
            setLightboxSpotlightIndex(index);
        };

    const // Infinite & Masonry Photo Album Controls
        fetchMorePhotos = async () => {
            console.log("Fetch More Photos For Infinite Scroll");
            return null;
        };

    return isLoadingGallery ? (<Loader />) : galleryError ? (
        <div>
            {galleryError?.data?.message || galleryError?.error || UNKNOWN_ERROR}
        </div>
    ) : (
        <div>
            <div className={"text-start"}>
                <h2>Gallery View: {categoryRequested}</h2>
                {
                    filtersInUse && (
                        <>
                            <h4>Filters: {filterState?.query}</h4>
                        </>
                    )
                }
                {
                    gallery?.length === 0 && (
                        <NoPhotosBlock />
                    )
                }
                {
                    (galleryTypeView !== "Travel" &&  gallery.length > 0 && !filtersInUse) && (
                        <>
                            <InfiniteScroll singleton
                                            photos={gallery}
                                            fetch={fetchMorePhotos}
                                            retries={5}
                                            onClick={({ photos, photo, index, event }) => openLightbox(index)}
                                            onMouseEnter={() => setIsHovering(true)}
                                            onMouseLeave={() => setIsHovering(false)}
                            >
                                <MasonryPhotoAlbum
                                    photos={gallery}
                                    columns={adjustBoxSizing}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                />
                            </InfiniteScroll>
                        </>
                    )
                }
                {
                    galleryTypeView === "Travel" && (
                        <>
                            {[...travelPhotoGroups.entries()].map(([locationTime, subsetPhotoList], index) => (
                                <div className={"mb-5"}>
                                    <h3 className={"text-decoration-underline text-start mt-4"}>{locationTime}</h3>
                                    <MasonryPhotoAlbum
                                        photos={subsetPhotoList}
                                        columns={adjustBoxSizing}
                                        onClick={(evt) => openLightbox(evt.index)}
                                    />
                                </div>
                            ))}
                        </>
                    )
                }
                {
                    filtersInUse && (
                        <>
                            <MasonryPhotoAlbum
                                photos={filteredGallery}
                                columns={adjustBoxSizing}
                                onClick={(evt) => openLightbox(evt.index)}
                            />
                        </>

                    )
                }
                <Lightbox
                    slides={gallery}
                    index={lightboxSpotlightIndex}
                    open={showLightbox}
                    close={() => setShowLightbox(false)}
                    plugins={[Captions, Download, Zoom]}
                    captions={{ref: photoCaptionsRefForLightbox}}
                    on={{
                        click: () => {
                            (photoCaptionsRefForLightbox.current?.visible
                                ? photoCaptionsRefForLightbox.current?.hide
                                : photoCaptionsRefForLightbox.current?.show)?.();
                        },
                    }}
                    zoom={{ref: photoCaptionsRefForLightbox}}
                    sizes={{
                        size: "3200px",
                        sizes: [
                            {
                                viewport: "(max-width: 3200px)",
                                size: "calc(100vw - 32px)",
                            },
                        ],
                    }}
                />
            </div>
        </div>
    )
}
