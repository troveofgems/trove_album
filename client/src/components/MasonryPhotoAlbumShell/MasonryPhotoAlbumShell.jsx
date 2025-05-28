import React from "react";
import {MasonryPhotoAlbum} from "react-photo-album";
import {mapPhotoData} from "../../utils/photo.utils";

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
    photos = null,
    columns = adjustBoxSizing,
    openLightbox,
    overridePhotoSizes = null,
    overrideBreakpoints = null,
    rtkData = null,
    overrideRTKData = false
}) => (
    <div className={"pb-5"}>
        <MasonryPhotoAlbum
            photos={overrideRTKData ? photos : mapPhotoData(rtkData)}
            columns={columns}
            breakpoints={overrideBreakpoints || initialBreakpoints}
            sizes={overridePhotoSizes || initialPhotoSizes}
            render={{
                image: (props, { photo, index }) => (
                    <img
                        src={props.src}
                        alt={props.alt}
                        title={props.title}
                        height={"100%"}
                        width={"100%"}
                        className={"link"}
                        onClick={evt => openLightbox(evt)}
                        key={`masonry_tile_${photo.uniqueKey}_${index}`}
                    />
                )
            }}
        />
    </div>
);