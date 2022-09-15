import { apiSlice } from "../api/apiSlice";

export interface IUserObjectInConversation {
  email: string;
  name: string;
  id: number;
}
export interface IConversation {
  id: number;
  participants: string;
  users: IUserObjectInConversation[];
  message: string;
  timestamp: string;
}
const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversation: builder.query<IConversation[], string>({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      }),
    }),
  }),
});

export const { useGetConversationQuery } = conversationApi;
