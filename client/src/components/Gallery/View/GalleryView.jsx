import React, {useEffect, useState} from 'react';
import "react-photo-album/masonry.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import { MasonryPhotoAlbum } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
//import Share from "yet-another-react-lightbox/plugins/share"; // Broken

import { UNKNOWN_ERROR } from "../../../constants/frontend.constants";
import { useFetchGalleryQuery } from "../../../redux/slices/gallery.api.slice";
import {Loader} from "../../shared/Loader/Loader";

export const GalleryView = ({ currentView: categoryRequested }) => {
    const
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        captionsRef = React.useRef(null),
        [gallery, setGallery] = useState([]),
        [galleryTypeView, setGalleryTypeView] = useState(null),
        [useIndex, setIndex] = useState(0),
        [travelPhotoGroups, setTravelPhotoGroups] = useState(null),
        [open, setOpen] = useState(false);


    const processGalleryView = (categoryToShow, fullGallery) => {
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

            // Extract unique location-time pairs
            const result = [...new Set(
                filteredCategoryView.map(image =>
                    `${image.tags[image.tags.length - 1]} - ${image.tags[image.tags.length - 2]}`
                )
            )];

            console.log('Unique location-time pairs:', result);

            // Process each image
            filteredCategoryView.forEach(image => {
                const locationTime = `${image.tags[image.tags.length - 1]} - ${image.tags[image.tags.length - 2]}`;

                console.log("Location Time: ", locationTime);

                // Add image to the appropriate group
                if (!photoGroups.has(locationTime)) {
                    photoGroups.set(locationTime, []);
                }
                photoGroups.get(locationTime).push(image);
            });

            photoGroups.forEach((photos, locationTime) => {
                console.log(`\n${locationTime}:`);
                console.log('Photos:', photos.map(p => ({ ...p })));
            });

            console.log(photoGroups);
            setTravelPhotoGroups(photoGroups);
        }
        setGalleryTypeView(categoryToShow);
        setGallery(filteredCategoryView);
    };
    const openLightbox = (photoIndex = 0) => {
        setOpen(true);
        setIndex(photoIndex);
    };

    const openLightboxFromSubset = (photoIndex, subsetPhotoList) => {
        console.log("Using openLightboxFromSubset...", photoIndex, subsetPhotoList);
        setOpen(true);
        setIndex(photoIndex);
    }

    useEffect(() => {
        if(!isLoadingGallery && photoGallery) {
            setGallery(photoGallery.data.fullGallery);
            processGalleryView(categoryRequested, photoGallery.data.fullGallery);
        }
    }, [categoryRequested, photoGallery]);

    return (
        <>
            { isLoadingGallery ? <Loader /> : galleryError ? (
                <div>
                    {galleryError?.data?.message || galleryError?.error || UNKNOWN_ERROR}
                </div>
            ) : (
                <>
                    {galleryTypeView === "Travel" ? (
                        <>
                            <h2 className={"text-start mb-5"}>Gallery View: {categoryRequested}</h2>
                            {gallery?.length === 0 ? (
                                <h4>No Photos Currently Uploaded 😭</h4>
                            ) : (
                                <>
                                    {[...travelPhotoGroups.entries()].map(([locationTime, subsetPhotoList], index) => (
                                        <>
                                            <h3 className={"text-decoration-underline text-start mt-4"}>{locationTime}</h3>
                                            <MasonryPhotoAlbum
                                                photos={subsetPhotoList}
                                                columns={(containerWidth) => {
                                                    if (containerWidth < 400) return 1;
                                                    if (containerWidth < 800) return 3;
                                                    if (containerWidth < 1200) return 5;
                                                    return 7;
                                                }}
                                                onClick={() => openLightboxFromSubset(index, subsetPhotoList)}
                                            />
                                        </>
                                    ))}
                                    <Lightbox
                                        slides={gallery}
                                        index={useIndex}
                                        open={open}
                                        close={() => setOpen(false)}
                                        plugins={[Captions, Download, Zoom]}
                                        captions={{ref: captionsRef}}
                                        on={{
                                            click: () => {
                                                (captionsRef.current?.visible
                                                    ? captionsRef.current?.hide
                                                    : captionsRef.current?.show)?.();
                                            },
                                        }}
                                        zoom={{ref: captionsRef}}
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
                                </>
                            )}
                        </>
                    ) : (
                        <div className={"mb-5"}>
                            <h2 className={"text-start mb-5"}>Gallery View: {categoryRequested}</h2>
                            { gallery?.length === 0 ? (
                                <h4>No Photos Currently Uploaded 😭</h4>
                            ) : (
                                <>
                                    <MasonryPhotoAlbum
                                        photos={gallery}
                                        columns={(containerWidth) => {
                                            if (containerWidth < 400) return 1;
                                            if (containerWidth < 800) return 3;
                                            if (containerWidth < 1200) return 5;
                                            return 7;
                                        }}
                                        onClick={({index}) => openLightbox(index)}
                                    />
                                    <Lightbox
                                        slides={gallery}
                                        index={useIndex}
                                        open={open}
                                        close={() => setOpen(false)}
                                        plugins={[Captions, Download, Zoom]}
                                        captions={{ref: captionsRef}}
                                        on={{
                                            click: () => {
                                                (captionsRef.current?.visible
                                                    ? captionsRef.current?.hide
                                                    : captionsRef.current?.show)?.();
                                            },
                                        }}
                                        zoom={{ref: captionsRef}}
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
                                </>
                            ) }
                        </div>
                    )}
                </>
            )}
        </>
    );
}
