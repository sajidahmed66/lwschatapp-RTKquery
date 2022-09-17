import { apiSlice } from "../api/apiSlice";
import { IUserObjectInConversation } from "../conversations/conversationApi";
export interface IMessagesObj {
  id: number;
  conversationId: number;
  sender: IUserObjectInConversation;
  receiver: IUserObjectInConversation;
  message: string;
  timestamp: number;
}

const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<IMessagesObj[], number>({
      query: (id) => ({
        url: `/messages?conversationId_like=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      }),
    }),
    addMessage: builder.mutation({
      query: (data: IMessagesObj) => ({
        url: `/messages`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messageApi;

export default messageApi;
