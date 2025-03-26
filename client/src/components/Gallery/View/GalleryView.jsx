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
import {useLocation} from "react-router-dom";

import "./GalleryView.css";

export const GalleryView = ({ currentView: categoryRequested }) => {
    const
        { state: filterState } = useLocation(),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        [galleryFromServer, setGalleryFromServer] = useState(null),
        [gallery, setGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [filtersInUse, setFiltersInUse] = useState(false),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null);

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
            let secondaryFilter = [];

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

            if(filterByExact) { // Priority 0
                let exactFilterValues = extractExactQuotationMaterialFromFilterQuery(lowercasedFilters);

                exactFilterValues.forEach((searchParam) => {
                    let searchValue = searchParam.replace(/"/g, "");
                    searchValue = searchValue.replace(/'/g, "");
                    let subsetList = galleryFromServer.filter((photo) => (photo.title.toLowerCase().includes(searchValue.trim().toLowerCase())));
                    secondaryFilter.push(...subsetList);
                });
            }

            if(filterByExclusion) { // Priority 1
                let exclusionFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, '-',  1);

                exclusionFilterValues.forEach((searchParam) => {
                    if(secondaryFilter.length > 0) {
                        secondaryFilter = secondaryFilter.filter((photo) => !photo.title.toLowerCase().includes(searchParam));
                    } else {
                        secondaryFilter = galleryFromServer.filter((photo) => !photo.title.toLowerCase().includes(searchParam));
                    }
                });
            }

            if(filterByFuzzy) {
                let fuzzyFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "~", 1);

                fuzzyFilterValues.forEach((searchParam) => {
                    let
                        subsetList_PTitle = galleryFromServer.filter((photo) => photo.title.toLowerCase().includes(searchParam)),
                        subsetList_PDesc = galleryFromServer.filter((photo) => photo.description.toLowerCase().includes(searchParam));

                    secondaryFilter = [...new Set([...secondaryFilter, ...subsetList_PTitle, ...subsetList_PDesc].map(JSON.stringify))].map(JSON.parse);
                });
            }

            if(filterByWebsiteOnly) {
                let siteFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "site:", 5);

                siteFilterValues.forEach((searchParam) => {
                    let subsetList = galleryFromServer.filter((photo) => photo.title.toLowerCase().includes(searchParam));
                    secondaryFilter = [...new Set([...secondaryFilter, ...subsetList].map(JSON.stringify))].map(JSON.parse);
                });
            }

            if(filterByAllSites) {
                console.log("Not Implemented: Filter By All Sites");
            }

            if(filterByNumberRange) {
                let dateRangeFilter = extractDateRangesFromFilterQuery(lowercasedFilters);
                dateRangeFilter.beforeDates.forEach((beforeDate, i) => {
                    if(secondaryFilter.length > 0) {
                        secondaryFilter = secondaryFilter.filter((photo) => {
                            let photoYear = photo.photoTakenOn.split(",")[0].split("/")[2];
                            return !!photoYear && (photoYear >= beforeDate && photoYear <= dateRangeFilter.afterDates[i]);
                        });
                    } else {
                        secondaryFilter = galleryFromServer.filter((photo) => {
                            let photoYear = photo.photoTakenOn.split(",")[0].split("/")[2];
                            return !!photoYear && (photoYear >= beforeDate && photoYear <= dateRangeFilter.afterDates[i]);
                        });
                    }
                });

            }

            if(filterByFileType) {
                let fileTypeFilterValues = extractMaterialFromFilterQuery(lowercasedFilters, "filetype:", 9);
                fileTypeFilterValues.forEach((searchParam) => {
                   if(secondaryFilter.length > 0) {
                       secondaryFilter = secondaryFilter.filter((photo) => photo.src.includes(searchParam));
                   } else {
                       secondaryFilter = galleryFromServer.filter((photo) => photo.src.includes(searchParam));
                   }
                });
            }

            setFiltersInUse(true);
            filteredGallery = secondaryFilter;
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
            if(galleryFromServer === null) {
                setGalleryFromServer(photoGallery.data.fullGallery);
            } else {
                processGalleryView(categoryRequested, filterState?.query);
            }
        } else {
            console.log("Loading Gallery From Server...", new Date());
        }
    }, [categoryRequested, isLoadingGallery, galleryFromServer, filterState]);

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

    const extractExactQuotationMaterialFromFilterQuery = (text) => text.match(/(["'])(.*?)\1/g);
    const extractMaterialFromFilterQuery = (filterStr, pattern, slicePosition) => filterStr.split(' ').filter(p => p.startsWith(pattern)).map(p => p.slice(slicePosition));
    const extractDateRangesFromFilterQuery = (filterStr) => {
        // Find all patterns matching XXXX..XXXX where X is a digit
        const dateRanges = filterStr.match(/\d+..\d+/g);

        // Return empty object if no date ranges found
        if (!dateRanges) {
            return {
                beforeDates: [],
                afterDates: []
            };
        }

        // Process each date range
        const result = {
            beforeDates: [],
            afterDates: []
        };

        dateRanges.forEach(range => {
            // Split each range into start and end dates
            const [before, after] = range.split('..');

            // Convert strings to integers and store
            result.beforeDates.push(parseInt(before));
            result.afterDates.push(parseInt(after));
        });

        return result;
    }

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
                                        render={{
                                            image: (props, { photo }) => {
                                                return (<img
                                                    src={props.src}
                                                    alt={props.alt}
                                                    title={props.title}
                                                    height={"100%"}
                                                    width={"100%"}
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
                            (galleryTypeView === "Travel" && !filtersInUse) && (
                                <>
                                    {[...travelPhotoGroups.entries()].map(([locationTime, subsetPhotoList], index) => (
                                        <div className={"mb-5 pb-5"} key={`${index}_travel`}>
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
                                                    image: (props, { photo }) => {
                                                        return (<img
                                                            src={props.src}
                                                            alt={props.alt}
                                                            title={props.title}
                                                            height={"100%"}
                                                            width={"100%"}
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
                                                    height={"100%"}
                                                    width={"100%"}
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
                                                    height={"100%"}
                                                    width={"100%"}
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