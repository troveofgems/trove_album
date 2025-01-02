import React, {useEffect, useState} from 'react';

import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";

import LouTest from "../../../assets/images/pets/IMG_1760.JPG";
import BoofTest from "../../../assets/images/pets/WXNX0471.JPG";
import MisterTest from "../../../assets/images/pets/CRIH3889.JPG";
import LouTest2 from "../../../assets/images/pets/IMG_2721.PNG";
import GMA from "../../../assets/images/family/paternal/gma_gpa.jpg";
import GMAAunt from "../../../assets/images/family/paternal/gma_aunt.JPG";
import Brett from "../../../assets/images/family/direct/IMG_5573.jpg";
import Baking from "../../../assets/images/baking/IMG_1879.jpg";

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";
//import Share from "yet-another-react-lightbox/plugins/share"; // Broken
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

const
    photoAlbum_Pets = [
        {
            src: `${LouTest}`,
            alt: "Alt Text Of Photo",
            width: 1000,
            height: 1200,
            /*srcSet: [
                { src: `${LouTest}`, width: 800, height: 600 },
                { src: `${LouTest}`, width: 1080, height: 1080 },
            ],*/
            title: "Slide title",
            description: "Slide description",
            downloadUrl: "",
            downloadFilename: "",
            share: { url: "/image3.png", title: "Image title" },
        },
        { src: `${BoofTest}`, width: 1080, height: 1080 },
        { src: `${MisterTest}`, width: 2592, height: 1944 },
        { src: `${LouTest2}`, width: 828, height: 1792 },
    ],
    photoAlbum_Family = [
        { src: `${GMA}`, width: 985, height: 1006 },
        { src: `${GMAAunt}`, width: 1831, height: 1474 },
        { src: `${Brett}`, width: 4032, height: 3024 },
    ],
    photoAlbum_Baking = [
        { src: `${Baking}`, width: 3024, height: 4032 },
    ],
    photoAlbums = {
        family: photoAlbum_Family,
        baking: photoAlbum_Baking,
        pets: photoAlbum_Pets
    };

const processGalleryView = (view, albums) => {
    let gallery = [];
    switch (view) {
        case "Family":
            gallery = albums.family;
            break;
        case "Pets":
            gallery = albums.pets;
            break;
        case "Food & Baking":
            gallery = albums.baking;
            break;
        default:
            return gallery = [...albums?.family, ...albums?.pets, ...albums?.baking];
    }
    return gallery;
}

export const GalleryView = ({ currentView }) => {
    const
        captionsRef = React.useRef(null),
        [useIndex, setIndex] = useState(0),
        [open, setOpen] = useState(false),
        [photos, setPhotos] = useState([]);

    const openLightbox = (photoIndex = 0) => {
        setOpen(true);
        setIndex(photoIndex);
    };

    useEffect(() => {
        setPhotos(processGalleryView(currentView, photoAlbums));
    }, [currentView]);

    return (
        <>
            <h2 className={"text-start mb-5"}>Current Gallery: {currentView}</h2>
            <MasonryPhotoAlbum
                photos={photos}
                columns={(containerWidth) => {
                    if (containerWidth < 400) return 1;
                    if (containerWidth < 800) return 3;
                    if (containerWidth < 1200) return 5;
                    return 7;
                }}
                onClick={({ index }) => openLightbox(index)}
            />
            <Lightbox
                slides={photos}
                index={useIndex}
                open={open}
                close={() => setOpen(false)}
                plugins={[Captions, Download, Zoom]}
                captions={{ ref: captionsRef }}
                on={{
                    click: () => {
                        (captionsRef.current?.visible
                            ? captionsRef.current?.hide
                            : captionsRef.current?.show)?.();
                    },
                }}
                zoom={{ ref: captionsRef }}
            />
        </>
    );
}


/*sizes={{
                    size: "2400px",
                    sizes: [
                        {
                            viewport: "(max-width: 2400px)",
                            size: "calc(100vw - 32px)",
                        },
                    ],
                }}*/