import React from "react";
import {MasonryPhotoAlbum} from "react-photo-album";

const adjustBoxSizing = (containerWidth) => {
    if (containerWidth < 400) return 1;
    if (containerWidth < 800) return 3;
    if (containerWidth < 1200) return 5;
    return 7;
}

const initialPhotoSizes = {
    size: "1168px",
    sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
};

const initialBreakpoints = [220, 360, 480, 600, 900, 1200];

export const MasonryPhotoAlbumShell = ({
    photos,
    columns = adjustBoxSizing,
    openLightbox,
    overridePhotoSizes = null,
    overrideBreakpoints = null
}) => {

    const printPhoto = {
        image: (props, { photo }) => (
            <img
                src={props.src}
                alt={props.alt}
                title={props.title}
                height={"100%"}
                width={"100%"}
                className={"link"}
                onClick={evt => openLightbox(evt)}
                key={`masonry_tile_${photo.uniqueKey}`}
            />
        )
    };

    return (
        <MasonryPhotoAlbum
            photos={photos}
            columns={columns}
            breakpoints={overrideBreakpoints || initialBreakpoints}
            sizes={overridePhotoSizes || initialPhotoSizes}
            render={printPhoto}
        />
    );
}