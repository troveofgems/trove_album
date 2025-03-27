import {GALLERY_URL} from "../../constants/frontend.constants";
import {apiSlice} from "./api.slice";

export const galleryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchGallery: builder.query({
            query: ({ limit, totalRounds, currentRound, skip }) => ({
                url: `${GALLERY_URL}`,
                params: { limit, totalRounds, currentRound, skip }
            }),
            providesTags: ['Photos'],
            keepUnusedDataFor: 5
        }),
        fetchPhotoById: builder.query({
           query: ({ photoId }) => ({
               url: `${GALLERY_URL}/${photoId}`
           }) ,
            keepUnusedDataFor: 5
        }),
        searchGalleryByKeyword: builder.query({
            query: ({ keywords }) => ({
                url: `${GALLERY_URL}/search`,
                params: {
                    keywords,
                }
            }),
            keepUnusedDataFor: 5
        }),
        addPhoto: builder.mutation({
            query: (data) => ({
                url: `${GALLERY_URL}`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ['Photos']
        }),
        updatePhoto: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "PUT",
                body: updates
            }),
            invalidatesTags: ['Photos']
        }),
        updatePhotoPatch: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "PATCH",
                body: updates
            }),
            invalidatesTags: ["Photos"]
        }),
        deletePhoto: builder.mutation({
            query: ({ photoId, cloudinaryPublicId, frontendAPIRequestTS }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "DELETE",
                body: {
                    cloudinaryPublicId: cloudinaryPublicId,
                    frontendAPIRequestTS: frontendAPIRequestTS
                }
            }),
            invalidatesTags: ["Photos"]
        }),
    })
});

export const {
    useFetchGalleryQuery,
    useSearchGalleryQuery,
    useAddPhotoMutation,
    useUpdatePhotoMutation,
    useDeletePhotoMutation
} = galleryApiSlice;

export default galleryApiSlice.reducer;