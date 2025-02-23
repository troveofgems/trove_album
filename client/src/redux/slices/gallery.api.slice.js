import {GALLERY_URL} from "../../constants/frontend.constants";
import {apiSlice} from "./api.slice";

export const galleryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchGallery: builder.query({
            query: () => ({
                url: `${GALLERY_URL}`,
            }),
            keepUnusedDataFor: 5
        }),
        fetchPhotoById: builder.query({
           query: ({ photoId }) => ({
               url: `${GALLERY_URL}/${photoId}`
           }) ,
            keepUnusedDataFor: 5
        }),
        addPhoto: builder.mutation({
            query: (data) => ({
                url: `${GALLERY_URL}`,
                method: "POST",
                body: data
            })
        }),
        updatePhoto: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "PUT",
                body: updates
            })
        }),
        updatePhotoPatch: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "PATCH",
                body: updates
            })
        }),
        deletePhoto: builder.mutation({
            query: ({ photoId, cloudinaryPublicId, frontendAPIRequestTS }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "DELETE",
                body: {
                    cloudinaryPublicId: cloudinaryPublicId,
                    frontendAPIRequestTS: frontendAPIRequestTS
                }
            })
        }),
    })
});

export const {
    useFetchGalleryQuery,
    useAddPhotoMutation,
    useUpdatePhotoMutation,
    useDeletePhotoMutation
} = galleryApiSlice;

export default galleryApiSlice.reducer;