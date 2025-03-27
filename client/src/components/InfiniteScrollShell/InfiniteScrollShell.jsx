import {MasonryPhotoAlbumShell} from "../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {UnstableInfiniteScroll as InfiniteScroll} from "react-photo-album/scroll";
import React from "react";

export const InfiniteScrollShell = ({ photos, openLightbox, fetchMorePhotos }) => {
    return (
        <InfiniteScroll singleton
                        photos={photos}
                        fetch={fetchMorePhotos}
                        retries={5}
        >
            <MasonryPhotoAlbumShell
                photos={photos}
                openLightbox={openLightbox}
            />
        </InfiniteScroll>
    );
}