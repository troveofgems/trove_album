import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    photos: null,
    videos: null
};

const gallerySlice = createSlice({
    name: "gallery",
    initialState,
    reducers: {
        setGalleryPhotos: (state, action) => {
            state.photos = action.payload;
        },
        setGalleryVideos: (state, action) => {
            state.videos = action.payload;
        }
    }
});

export const {
    setGalleryPhotos,
    setGalleryVideos
} = gallerySlice.actions;

export default gallerySlice.reducer;