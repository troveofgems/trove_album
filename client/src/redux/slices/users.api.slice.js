import {apiSlice} from "./api.slice";
import {USER_URL} from "../../constants/frontend.constants";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
          query: (data) => ({
              url: `${USER_URL}/login`,
              method: "POST",
              body: data
          })
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USER_URL}/logout`,
                method: "POST"
            })
        })
    })
});

export const { useLoginMutation, useLogoutMutation } = usersApiSlice;

export default usersApiSlice.reducer;