import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {BASE_URL} from "../../constants/frontend.constants";

const baseQuery = fetchBaseQuery({
    baseURL: BASE_URL
})

export const apiSlice = createApi({
    baseQuery,
    tagTypes: [
        "Auth", "Gallery", "User"
    ],
    endpoints: (build) => ({})
});

