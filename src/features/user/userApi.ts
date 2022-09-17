import { apiSlice } from "../api/apiSlice";
import { IUserObjectInConversation } from "../conversations/conversationApi";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<IUserObjectInConversation[], string>({
      query: (email: string) => ({
        url: `/users?email=${email}`,
      }),
    }),
  }),
});

export const { useGetUserQuery } = userApi;
