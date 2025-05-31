import {ADMIN_URL, VIDEO_GALLERY_URL} from "../../constants/frontend.constants";
import {apiSlice} from "./api.slice";

export const videoApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addVideo: builder.mutation({
            query: ({ formData, dispatch, setUploadProgress }) => ({
                url: `${ADMIN_URL}/resource-management/videos`,
                method: "POST",
                body: formData,
                onUploadProgress: async (
                    progressEvent,
                    { signal }
                ) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    // Dispatch an action to update progress
                    dispatch(setUploadProgress(percentCompleted));

                    // Check if request was cancelled
                    if (signal.aborted) {
                        throw new Error('Upload cancelled');
                    }
                }
            }),
            invalidatesTags: ['Videos']
        }),
        fetchVideos: builder.query({
            query: () => ({
                url: `${VIDEO_GALLERY_URL}`
            }),
            keepUnusedData: 5,
            providesTags: ["Videos"]
            /*transformResponse: (response) => response.data*/
        })
    })
});

export const {
    useAddVideoMutation,
    useFetchVideosQuery
} = videoApiSlice;

export default videoApiSlice.reducer;
