import { io } from "socket.io-client";
import { apiSlice } from "../api/apiSlice";
import { IUserObjectInConversation } from "../conversations/conversationApi";
export interface IMessagesObj {
  id?: number;
  conversationId: number;
  sender: IUserObjectInConversation;
  receiver: IUserObjectInConversation;
  message: string;
  timestamp: number;
}

const messageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<IMessagesObj[], number | string>({
      query: (id) => ({
        url: `/messages?conversationId_like=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      }),
      onCacheEntryAdded: async (
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) => {
        const socket = io("http://localhost:9000", {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        // create a new socket to listen to any changes that is made on the server side and update optimistically on the client side
        try {
          await cacheDataLoaded;
          socket.on("messages", (data) => {
            updateCachedData((draft) => {
              draft.unshift(data.data);
            });
          });
        } catch (error) {}
      },
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
