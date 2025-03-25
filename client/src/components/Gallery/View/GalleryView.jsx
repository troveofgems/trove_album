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

import "./GalleryView.css";

export const GalleryView = ({ currentView: categoryRequested, setIsHovering }) => {
    const
        { state: filterState } = useLocation(),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        [showGallery, setShowGallery] = useState(false),
        [gallery, setGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [filtersInUse, setFiltersInUse] = useState(false),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null);

    const processGalleryView = (categoryToShow, fullGallery, filters) => {
        setShowGallery(false);
        if(categoryToShow === "All Items") {
            setGalleryTypeView(categoryToShow);
            setFiltersInUse(false);
            setGallery(fullGallery);
        } else if (categoryToShow === "Travel") {
            const photoGroups = new Map();
            let travelPhotos = fullGallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
            travelPhotos.forEach((image) => {
                const locationTime = `${image.tags[image.tags.length - 1]} ${image.tags[image.tags.length - 2]}`;

                console.log("Location Time: ", locationTime);

                // Add image to the appropriate group
                if (!photoGroups.has(locationTime)) {
                    photoGroups.set(locationTime, []);
                }
                photoGroups.get(locationTime).push(image);
            });
            setTravelPhotoGroups(photoGroups);
            setGalleryTypeView(categoryToShow);
            setFiltersInUse(false);
            setGallery(travelPhotos);
        } else {
            let filteredView = fullGallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
            setGalleryTypeView(categoryToShow);
            setGallery(filteredView);
        }

        setShowGallery(true);

       /* if(!!filters && filters.length > 0) {
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
        }*/
    };

    const adjustBoxSizing = (containerWidth) => {
        if (containerWidth < 400) return 1;
        if (containerWidth < 800) return 3;
        if (containerWidth < 1200) return 5;
        return 7;
    }

    useEffect(() => {
        if(!isLoadingGallery && !!photoGallery) {
            setGallery(photoGallery.data.fullGallery);
            processGalleryView(categoryRequested, photoGallery.data.fullGallery, filterState?.query);
        }
    }, [categoryRequested, photoGallery, filterState, isLoadingGallery]);

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

    return (
        <>
            {isLoadingGallery && (<Loader />)}
            {galleryError && (
                <div>
                    {galleryError?.data?.message || galleryError?.error || UNKNOWN_ERROR}
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
                                        <h4>Filters: {filterState?.query}</h4>
                                    </>
                                )
                            }
                        </div>
                        {gallery?.length === 0 && (
                            <NoPhotosBlock />
                        )}
                        {
                            galleryTypeView === "All Items" && (
                                <InfiniteScroll singleton
                                                photos={gallery}
                                                fetch={fetchMorePhotos}
                                                retries={5}
                                                onClick={({ photos, photo, index, event }) => openLightbox(index)}
                                >
                                    <MasonryPhotoAlbum
                                        photos={gallery}
                                        render={{
                                            image: (props, {photo, width, height}) => {
                                                console.log(props);
                                                return (<img src={photo.src} alt={photo.alt} height={height} width={width}
                                                     className={"link"}/>)
                                            },
                                        }}
                                        columns={adjustBoxSizing}
                                        sizes={{
                                            size: "1168px",
                                            sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                        }}
                                        breakpoints={[220, 360, 480, 600, 900, 1200]}
                                    />
                                </InfiniteScroll>
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
                                                breakpoints={[220, 360, 480, 600, 900, 1200]}
                                                sizes={{
                                                    size: "1168px",
                                                    sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                }}
                                            />
                                        </div>
                                    ))}
                                </>
                            )
                        }
                        {
                            (galleryTypeView !== "All Items" && galleryTypeView !== "Travel") && (
                                <>
                                    <MasonryPhotoAlbum
                                        photos={gallery}
                                        columns={adjustBoxSizing}
                                        onClick={(evt) => openLightbox(evt.index)}
                                        breakpoints={[220, 360, 480, 600, 900, 1200]}
                                        sizes={{
                                            size: "1168px",
                                            sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                        }}
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
                            controller={{ closeOnBackdropClick: true, closeOnPullUp: true, closeOnPullDown: true }}
                        />
                    </>
                )
            }
        </>
    )
}
