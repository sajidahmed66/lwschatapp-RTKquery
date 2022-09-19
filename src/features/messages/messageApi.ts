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
    getMessages: builder.query<
      { data: IMessagesObj[]; totalCount: number },
      number
    >({
      query: (id) => ({
        url: `/messages?conversationId_like=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      }),
      transformResponse: (apiresponse, meta) => {
        const totalCount = meta?.response?.headers.get("X-Total-Count");
        return {
          data: apiresponse as IMessagesObj[],
          totalCount: Number(totalCount),
        };
      },
      onCacheEntryAdded: async (
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) => {
        const socket = io("https://lws-chat-app66.herokuapp.com", {
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
              draft.data.unshift(data.data);
            });
          });
        } catch (error) {
          await cacheEntryRemoved;
          socket.close();
        }
      },
    }),
    getMoreMessages: builder.query<
      IMessagesObj[],
      { id: number; page: number }
    >({
      query: ({ id, page }) => ({
        url: `/messages?conversationId_like=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
      }),
      onQueryStarted: async (args, { queryFulfilled, dispatch }) => {
        try {
          const updatedMessages = await queryFulfilled;
          if (updatedMessages.data.length > 0) {
            dispatch(
              messageApi.util.updateQueryData(
                "getMessages",
                args.id,
                (draft) => {
                  draft.data = [...draft.data, ...updatedMessages.data];
                }
              )
            );
          }
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
