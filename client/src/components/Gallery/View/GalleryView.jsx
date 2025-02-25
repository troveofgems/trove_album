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
        [useIndex, setIndex] = useState(0),
        [open, setOpen] = useState(false);


    const processGalleryView = (categoryToShow, fullGallery) => {
        let filteredCategoryView = [];
        if(categoryToShow === "All Items") {
            filteredCategoryView = fullGallery;
        } else {
            filteredCategoryView = fullGallery.filter((photo) => photo.tags.indexOf(categoryToShow) > -1);
        }
        setGallery(filteredCategoryView);
    };
    const openLightbox = (photoIndex = 0) => {
        setOpen(true);
        setIndex(photoIndex);
    };

    useEffect(() => {
        if(!isLoadingGallery && photoGallery) {
            console.log(photoGallery);
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
                    <h2 className={"text-start mb-5"}>Currently Viewing: {categoryRequested}</h2>
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
                </>
            )}
        </>
    );
}