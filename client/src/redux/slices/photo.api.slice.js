import {ADMIN_URL, PHOTO_GALLERY_URL} from "../../constants/frontend.constants";
import {apiSlice} from "./api.slice";

export const photoApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchPhotosForManagement: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/resource-management`
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
                    settings: {
                        filters: {
                            enabled: false,
                            category: "Pets",
                            userInputStr: null
                        }
                    }
                },
                getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
                    if (lastPage === undefined || lastPage.data === undefined) return undefined;
                    const nextPage = lastPageParam.page + 1;
                    const remainingPages = (Math.ceil(lastPage.data.photos.totalPhotoCount / lastPageParam.limit) - nextPage) + 1;
                    if (remainingPages <= 0) return undefined;
                    return {
                        ...lastPageParam,
                        page: nextPage,
                        maxPages: Math.ceil(lastPage.data.photos.totalPhotoCount / lastPageParam.limit),
                        offset: lastPageParam.limit * lastPageParam.page,
                    };
                },
                getPreviousPageParam: (
                    firstPage,
                    allPages,
                    firstPageParam,
                    allPageParams,
                ) => {
                    return firstPageParam > 0 ? firstPageParam - 1 : undefined
                }
            },
            query: ({ queryArg, pageParam }) => {
                return ({
                    url: `${PHOTO_GALLERY_URL}`,
                    params: {
                        uiFetchSettings: JSON.stringify(pageParam),
                    }
                })
            },
            keepUnusedDataFor: 30,
            transformResponse: (response) => {
                console.log("Transform Response? ", response);
                return response;
            },
            providesTags: ['Photos']
        }),
        fetchPhotoById: builder.query({
            query: ({ photoId }) => ({
                url: `${PHOTO_GALLERY_URL}/${photoId}`
            }) ,
            keepUnusedDataFor: 5
        }),
        addPhoto: builder.mutation({
            query: (data) => ({
                url: `${ADMIN_URL}/resource-management/photos`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ['Photos']
        }),
        updatePhoto: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${ADMIN_URL}/resource-management/photos/${photoId}`,
                method: "PUT",
                body: updates
            }),
            invalidatesTags: ['Photos']
        }),
        updatePhotoWithPatch: builder.mutation({
            query: ({ photoId, updates }) => ({
                url: `${ADMIN_URL}/resource-management/photos/${photoId}`,
                method: "PATCH",
                body: updates
            }),
            invalidatesTags: ["Photos"]
        }),
        deletePhoto: builder.mutation({
            query: ({ photoId }) => ({
                url: `${ADMIN_URL}/resource-management/photos/${photoId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Photos"]
        })
    })
});

export const {
    useFetchPhotosInfiniteQuery,
    useFetchPhotosForManagementQuery,
    useFetchPhotoByIdQuery,
    useAddPhotoMutation,
    useUpdatePhotoMutation,
    useUpdatePhotoWithPatchMutation,
    useDeletePhotoMutation
} = photoApiSlice;

export default photoApiSlice.reducer;
