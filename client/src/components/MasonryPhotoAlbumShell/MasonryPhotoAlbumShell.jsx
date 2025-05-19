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
    console.log("Photos? ", photos);

    // Function to deduplicate deeply nested objects
    function deduplicateObjects(arr) {
        const seen = new Map();

        function recursiveDedup(obj) {
            // Handle null and primitives
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }

            // Convert object to string for comparison
            const str = JSON.stringify(obj);

            // Check if we've seen this object before
            if (seen.has(str)) {
                return seen.get(str);
            }

            // For arrays, create new array and recurse on elements
            if (Array.isArray(obj)) {
                const newArr = obj.map(item => recursiveDedup(item));
                seen.set(str, newArr);
                return newArr;
            }

            // For objects, create new object and recurse on values
            const newObj = {};
            seen.set(str, newObj);

            for (const [key, value] of Object.entries(obj)) {
                newObj[key] = recursiveDedup(value);
            }

            return newObj;
        }

        const uniqueStrs = [...new Set(arr.map(item => JSON.stringify(recursiveDedup(item))))];

        return uniqueStrs.map(str => JSON.parse(str));
    }


    const imgSrc = {
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
    };

    return (
        <MasonryPhotoAlbum
            photos={deduplicateObjects(photos)}
            columns={columns}
            breakpoints={overrideBreakpoints || initialBreakpoints}
            sizes={overridePhotoSizes || initialPhotoSizes}
            render={imgSrc}
        />
    );
}