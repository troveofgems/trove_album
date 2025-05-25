import React from "react";
import {UnstableInfiniteScroll as InfiniteScroll} from "react-photo-album/scroll";
import {MasonryPhotoAlbumShell} from "../MasonryPhotoAlbumShell/MasonryPhotoAlbumShell";
import {mapPhotoData} from "../../utils/photo.utils";
import {FIVE} from "../../constants/frontend.constants";
import {Loader} from "../shared/Loader/Loader";

export const InfiniteScrollShell = ({
    photos = [],
    openLightbox = () => {},
    fetchMorePhotos = () => {},
    isLoading = false,
    isFetching = false
}) => (
    (isLoading || isFetching) ? (
        <Loader/>
    ) : (
        <InfiniteScroll singleton
                        photos={mapPhotoData(photos)}
                        fetch={fetchMorePhotos}
                        retries={FIVE}
        >
            <MasonryPhotoAlbumShell
                openLightbox={openLightbox}
                rtkData={photos}
            />
        </InfiniteScroll>
    )
);