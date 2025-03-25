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
        [gallery, setGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [filtersInUse, setFiltersInUse] = useState(false),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null);

    const processGalleryView = (categoryToShow, fullGallery, filters) => {
        console.log("filters", filters);
        let
            gallery = fullGallery,
            filteredGallery = [];

        // Do The Initial Filter By Category View
        if(categoryToShow === "All Items" && !filtersInUse) {
            filteredGallery = gallery;
        } else if (categoryToShow === "Travel" && !filtersInUse) {
            const photoGroups = new Map();
            let travelPhotos = gallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
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
        } else {
            filteredGallery = fullGallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
        }

        // Then Check for Provided Query Filters
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

            let secondaryFilter = [];

            if(filterByExact) {
                let filterStr = lowercasedFilters.replace(/'/g, "");

                filterStr = filterStr.replace(/"/g, "");

                secondaryFilter = filteredGallery.filter((photo) => photo.title.toLowerCase().includes(filterStr));
                filteredGallery = secondaryFilter;
            }

            if(filterByExclusion) {
                let filterStr = lowercasedFilters.replace(/-/g, "");

                secondaryFilter = filteredGallery.filter((photo) => !photo.title.toLowerCase().includes(filterStr));
                filteredGallery = secondaryFilter;
            }
        }

        // Finally Set The Data
        setGallery(filteredGallery);
        setGalleryTypeView(categoryToShow);
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

    const getTripLocation = (loc) => {
        const splitBySpace = loc.split(" ");

        let tripName = "";

        if(splitBySpace.length === 4) {
            tripName = `${splitBySpace[2]} ${splitBySpace[3]}`;
        } else if (splitBySpace.length === 5) {
            tripName = `${splitBySpace[2]} ${splitBySpace[3]} ${splitBySpace[4]}`;
        } // Not sure if this will get larger...Need a better way to handle this.

        return tripName;
    };

    const getTripDate = (loc) => {
        const splitBySpace = loc.split(" ");
        return `${splitBySpace[0]} ${splitBySpace[1]}`;
    };

    const getTripName = (photoList) => photoList[0].tags[1];

    return (
        <>
            {isLoadingGallery && (<div className={"d-flex w-100 min-vh-100 justify-content-center"}><Loader /></div>)}
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
                                        <h4 className={"text-white"}>Filters: {filterState?.query}</h4>
                                    </>
                                )
                            }
                        </div>
                        {gallery?.length === 0 && (
                            <NoPhotosBlock />
                        )}
                        {
                            (galleryTypeView === "All Items" && !filtersInUse) && (
                                <InfiniteScroll singleton
                                                photos={gallery}
                                                fetch={fetchMorePhotos}
                                                retries={5}
                                                onClick={({ photos, photo, index, event }) => openLightbox(index)}
                                >
                                    <MasonryPhotoAlbum
                                        photos={gallery}
                                        layout={"masonry"}
                                        render={{
                                            image: (props, {photo, width, height}) => {
                                                return (<img
                                                    src={props.src}
                                                    alt={props.alt}
                                                    title={props.title}
                                                    height={height}
                                                    width={width}
                                                    sizes={{
                                                        size: "1168px",
                                                        sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                    }}
                                                    className={"link"}
                                                    key={`masonry_tile_${photo.uniqueKey}`}
                                                />)
                                            },
                                        }}
                                        columns={adjustBoxSizing}
                                        breakpoints={[220, 360, 480, 600, 900, 1200]}
                                    />
                                </InfiniteScroll>
                            )
                        }
                        {
                            galleryTypeView === "Travel" && (
                                <>
                                    {[...travelPhotoGroups.entries()].map(([locationTime, subsetPhotoList], index) => (
                                        <div className={"mb-5 pb-5"}>
                                            <h3 className={"text-white text-decoration-underline text-start mt-4"}>{getTripName(subsetPhotoList)}</h3>
                                            <h5 className={"text-white text-start"}>{getTripDate(locationTime)} - {getTripLocation(locationTime)}</h5>
                                            <MasonryPhotoAlbum
                                                photos={subsetPhotoList}
                                                columns={adjustBoxSizing}
                                                breakpoints={[220, 360, 480, 600, 900, 1200]}
                                                sizes={{
                                                    size: "1168px",
                                                    sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                }}
                                                render={{
                                                    image: (props, {photo, width, height}) => {
                                                        return (<img
                                                            src={props.src}
                                                            alt={props.alt}
                                                            title={props.title}
                                                            height={height}
                                                            width={width}
                                                            sizes={{
                                                                size: "1168px",
                                                                sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                            }}
                                                            className={"link"}
                                                            key={`masonry_tile_${photo.uniqueKey}`}
                                                        />)
                                                    },
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
                                        render={{
                                            image: (props, {photo, width, height}) => {
                                                return (<img
                                                    src={props.src}
                                                    alt={props.alt}
                                                    title={props.title}
                                                    height={height}
                                                    width={width}
                                                    sizes={{
                                                        size: "1168px",
                                                        sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                    }}
                                                    className={"link"}
                                                    key={`masonry_tile_${photo.uniqueKey}`}
                                                />)
                                            },
                                        }}
                                        breakpoints={[220, 360, 480, 600, 900, 1200]}
                                    />
                                </>
                            )
                        }
                        {
                            filtersInUse && (
                                <>
                                    <MasonryPhotoAlbum
                                        photos={gallery}
                                        columns={adjustBoxSizing}
                                        onClick={(evt) => openLightbox(evt.index)}
                                        render={{
                                            image: (props, {photo, width, height}) => {
                                                return (<img
                                                    src={props.src}
                                                    alt={props.alt}
                                                    title={props.title}
                                                    height={height}
                                                    width={width}
                                                    sizes={{
                                                        size: "1168px",
                                                        sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                                                    }}
                                                    className={"link"}
                                                    key={`masonry_tile_${photo.uniqueKey}`}
                                                />)
                                            },
                                        }}
                                        breakpoints={[220, 360, 480, 600, 900, 1200]}
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
