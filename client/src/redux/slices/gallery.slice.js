import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    photos: null,
};

const gallerySlice = createSlice({
    name: "gallery",
    initialState,
    reducers: {
        setGallery: (state, action) => {
            state.photos = action.payload;
        }
    }
});

export const {
    setGallery
} = gallerySlice.actions;

export default gallerySlice.reducer;