import React from "react";
import {MasonryPhotoAlbum} from "react-photo-album";

const adjustBoxSizing = (containerWidth) => {
    if (containerWidth < 400) return 1;
    if (containerWidth < 800) return 3;
    if (containerWidth < 1200) return 5;
    return 7;
}

export const MasonryPhotoAlbumShell = ({
    photos,
    columns = adjustBoxSizing,
    openLightbox
}) => {
    return (
        <MasonryPhotoAlbum
            photos={photos}
            columns={columns}
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
                        /*sizes={{
                            size: "1168px",
                            sizes: [{ viewport: "(max-width: 1200px)", size: "calc(100vw - 32px)" }],
                        }}*/
                        className={"link"}
                        onClick={evt => openLightbox(evt)}
                        key={`masonry_tile_${photo.uniqueKey}`}
                    />)
                },
            }}
        />
    );
}