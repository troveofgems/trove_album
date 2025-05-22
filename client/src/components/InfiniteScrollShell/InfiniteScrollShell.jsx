import {MasonryPhotoAlbumShell} from "../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {UnstableInfiniteScroll as InfiniteScroll} from "react-photo-album/scroll";
import React from "react";
import {mapPhotoData} from "../../utils/photo.utils";

export const InfiniteScrollShell = ({ photos, openLightbox, fetchMorePhotos }) => (
    <InfiniteScroll singleton
                    photos={mapPhotoData(photos)}
                    fetch={fetchMorePhotos}
                    retries={5}
    >
        <MasonryPhotoAlbumShell
            openLightbox={openLightbox}
            rtkData={photos}
        />
    </InfiniteScroll>
);