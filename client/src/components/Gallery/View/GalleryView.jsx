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
import {useSelector} from "react-redux";

import {useDispatch} from "react-redux";
import {setGallery} from "../../../redux/slices/gallery.slice";

export const GalleryView = ({ currentView }) => {
    let
        photoAlbum_Pets = [],
        photoAlbum_Framily = [],
        photoAlbum_Food = [],
        photoAlbum_Gardening = [],
        photoAlbum_Travel = [];


    const processGalleryView = (view) => {
        let gallery = [];
        switch (view) {
            case "Family & Friends":
                gallery = photoAlbum_Framily;
                break;
            case "Pets":
                gallery = photoAlbum_Pets;
                break;
            case "Food & Baking":
                gallery = photoAlbum_Food;
                break;
            case "Gardening":
                gallery = photoAlbum_Gardening;
                break;
            case "Travel":
                gallery = photoAlbum_Travel;
                break;
            default:
                gallery = [...photoAlbum_Framily, ...photoAlbum_Pets, ...photoAlbum_Food, ...photoAlbum_Gardening, ...photoAlbum_Travel];
        }

        return setPhotos(gallery);
    }

    const { photos: GalleryPhotos } = useSelector((state) => state.gallery);
    const
        captionsRef = React.useRef(null),
        [useIndex, setIndex] = useState(0),
        [open, setOpen] = useState(false),
        [photos, setPhotos] = useState([]);

    const dispatch = useDispatch();

    const { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery();

    const openLightbox = (photoIndex = 0) => {
        setOpen(true);
        setIndex(photoIndex);
    };

    const sortPhotosIntoAlbums = (photoGallery) => {
        const processPhotoIntoAlbum = (photo, album) => {
            album.push(photo);
        }

        photoGallery.data.forEach(processPhoto => {
            const
                processFamilyAndFriends = processPhoto.tags.indexOf("Family & Friends") === 0,
                processPets = processPhoto.tags.indexOf("Pets") === 0,
                processFoodAndBaking = processPhoto.tags.indexOf("Food & Baking") === 0,
                processGardening = processPhoto.tags.indexOf("Gardening") === 0,
                processTravel = processPhoto.tags.indexOf("Travel") === 0;

            let photoToInsert = {
                src: processPhoto.src,
                alt: processPhoto.alt,
                width: processPhoto.width,
                height: processPhoto.height,
                srcSet: (processPhoto?.srcSet || []),
                title: processPhoto.captions.title,
                description: processPhoto.captions.description,
                download: { filename: processPhoto.download.filename  }
            }

            console.log("Photo to Insert into Array: ", photoToInsert);

            if(processFamilyAndFriends) {
                processPhotoIntoAlbum(photoToInsert, photoAlbum_Framily);
            } else if(processPets) {
                processPhotoIntoAlbum(photoToInsert, photoAlbum_Pets);
            } else if(processFoodAndBaking) {
                processPhotoIntoAlbum(photoToInsert, photoAlbum_Food);
            } else if (processGardening) {
                processPhotoIntoAlbum(photoToInsert, photoAlbum_Gardening);
            } else if (processTravel) {
                processPhotoIntoAlbum(photoToInsert, photoAlbum_Travel);
            } else {
                processPhotoIntoAlbum(photoToInsert, "allItems");
            }
        });
    }

    useEffect(() => {
        if(GalleryPhotos) {
            sortPhotosIntoAlbums(GalleryPhotos);
            processGalleryView(currentView);
        } else if (photoGallery && !isLoadingGallery && !GalleryPhotos) {
            dispatch(setGallery({...photoGallery}));
            sortPhotosIntoAlbums(photoGallery);
            processGalleryView(currentView);
        }
        processGalleryView(currentView);
    }, [currentView, photoGallery]);

    return (
        <>
            { isLoadingGallery ? <Loader /> : galleryError ? (
                <div>
                    {galleryError?.data?.message || galleryError?.error || UNKNOWN_ERROR}
                </div>
            ) : (
                <>
                    <h2 className={"text-start mb-5"}>Currently Viewing: {currentView}</h2>
                    { photos?.length === 0 ? (
                        <h4>No Photos Currently Uploaded 😭</h4>
                    ) : (
                        <>
                            <MasonryPhotoAlbum
                                photos={photos}
                                columns={(containerWidth) => {
                                    if (containerWidth < 400) return 1;
                                    if (containerWidth < 800) return 3;
                                    if (containerWidth < 1200) return 5;
                                    return 7;
                                }}
                                onClick={({index}) => openLightbox(index)}
                            />
                            <Lightbox
                                slides={photos}
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