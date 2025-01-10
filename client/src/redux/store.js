import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/api.slice";

import authSliceReducer from "./slices/auth.slice";
import gallerySliceReducer from "./slices/gallery.slice";

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSliceReducer,
        gallery: gallerySliceReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV === "development"
});

export default store;