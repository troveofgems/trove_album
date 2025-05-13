import {GALLERY_URL} from "../../constants/frontend.constants";
import {apiSlice} from "./api.slice";

export const galleryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchPhotosForManagement: builder.query({
            query: () => ({
                url: `${GALLERY_URL}`
            }),
            keepUnusedData: false,
            /*transformResponse: (response) => response.data*/
        }),
        fetchPhotos: builder.infiniteQuery ({
            infiniteQueryOptions: {
                initialPageParam: {
                    offset: 0,
                    limit: 10,
                    page: 1,
                    maxPages: 1,
                    filters: {
                        category: "Pets",
                        filterStr: null
                    }
                },
                getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
                    console.log("Logic For Next Fetch", lastPage, allPages, lastPageParam, allPageParams);
                    const nextPage = lastPageParam.page + 1;
                    console.log("Next Page Is: ", nextPage);
                    const remainingPages = (Math.ceil(lastPage.data.photos.totalPhotoCount / lastPageParam.limit) - nextPage) + 1;
                    console.log("Remaining Pages", remainingPages, lastPageParam?.maxPages);

                    if (remainingPages <= 0) {
                        return undefined
                    }

                    let updatedParams = {
                        ...lastPageParam,
                        page: nextPage,
                        maxPages: Math.ceil(lastPage.data.photos.totalPhotoCount / lastPageParam.limit),
                        offset: lastPageParam.limit * lastPageParam.page,
                    };
                    console.log("Updated Params: ", updatedParams)

                    console.log("Updated Next Params: ", updatedParams, lastPage.data);
                    return updatedParams;
                },
                // Optionally provide a `getPreviousPageParam` function
                getPreviousPageParam: (
                    firstPage,
                    allPages,
                    firstPageParam,
                    allPageParams,
                ) => {
                    console.log("Logic For Previous Fetch...");
                    return firstPageParam > 0 ? firstPageParam - 1 : undefined
                }
            },
            query: ({queryArg, pageParam, extraOptions }) => {
                console.log("Inside Query??? ", queryArg, pageParam, extraOptions);
                return ({
                    url: `${GALLERY_URL}`,
                    params: {
                        fetchSettings: JSON.stringify(pageParam),
                    }
                })
            },
            /*transformResponse: (response) => response.data*/
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
            query: ({ photoId }) => ({
                url: `${GALLERY_URL}/${photoId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Photos"]
        }),
    })
});

export const {
    useFetchPhotosInfiniteQuery,
    useFetchPhotosForManagementQuery,
    useAddPhotoMutation,
    useUpdatePhotoMutation,
    useDeletePhotoMutation,
} = galleryApiSlice;

export default galleryApiSlice.reducer;
