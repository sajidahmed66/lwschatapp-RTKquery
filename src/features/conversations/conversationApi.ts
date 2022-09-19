import { apiSlice } from "../api/apiSlice";
import messageApi, { IMessagesObj } from "../messages/messageApi";
import io from "socket.io-client";
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
    getConversations: builder.query<
      { data: IConversation[]; totalCount: number },
      string
    >({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      }),
      transformResponse: (apiresponse, meta) => {
        const totalCount = meta?.response?.headers.get("X-Total-Count");
        return {
          data: apiresponse as IConversation[],
          totalCount: Number(totalCount),
        };
      },
      onCacheEntryAdded: async (
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) => {
        //create socket
        const socket = io("http://localhost:9000", {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            updateCachedData((draft) => {
              const conversation = draft.data.find(
                (conversation) => conversation.id === data?.data?.id
              );
              if (conversation?.id) {
                conversation.message = data.data?.message;
                conversation.timestamp = data.data?.timestamp;
              } else {
                draft.data.unshift(data.data);
              }
            });
          });
        } catch (error) {}
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getUpdatedQueryConversations: builder.query<
      IConversation[],
      { email: string; page: number }
    >({
      query: ({ email, page }) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      }),
      onQueryStarted: async ({ email, page }, { queryFulfilled, dispatch }) => {
        try {
          const conversations = await queryFulfilled;
          if (conversations?.data.length) {
            //update conversations cache data pasimistically
            dispatch(
              conversationApi.util.updateQueryData(
                "getConversations",
                email,
                (draft) => {
                  draft.data = [...draft.data, ...conversations.data];
                }
              )
            );
          }
        } catch (error) {}
      },
    }),
    getConversation: builder.query<
      IConversation[],
      { userEmail: string; participantEmail: string }
    >({
      query: ({ userEmail, participantEmail }) => ({
        url: `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
      }),
    }),
    addConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: `/conversations`,
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
        const conversation = await queryFulfilled;
        if (conversation.data?.id) {
          //silent entry in message table
          // console.log(conversation);
          const users = arg.data?.users;
          const senderUser = users.find(
            (user: IUserObjectInConversation) => user.email === arg.sender
          );
          const recipientUser = users.find(
            (user: IUserObjectInConversation) => user.email !== arg.sender
          );
          dispatch(
            messageApi.endpoints.addMessage.initiate({
              conversationId: conversation.data.id,
              sender: senderUser,
              receiver: recipientUser,
              message: arg.data?.message,
              timestamp: arg.data?.timestamp,
            })
          );
        }
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, sender, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
        //optimistic cache update start
        const patchResult = dispatch(
          conversationApi.util.updateQueryData(
            "getConversations",
            arg.sender,
            (draft) => {
              const draftConversation = draft.data.find((c) => c.id == arg.id);
              if (draftConversation) {
                draftConversation.message = arg.data.message;
                draftConversation.timestamp = arg.data.timestamp;
              }
            }
          )
        );
        //optimistic cache update end

        try {
          const conversation = await queryFulfilled;
          if (conversation.data?.id) {
            //silent entry in message table
            const users = arg.data?.users;
            const senderUser = users.find(
              (user: IUserObjectInConversation) => user.email === arg.sender
            );
            const recipientUser = users.find(
              (user: IUserObjectInConversation) => user.email !== arg.sender
            );
            const res: IMessagesObj = await dispatch(
              messageApi.endpoints.addMessage.initiate({
                conversationId: conversation.data.id,
                sender: senderUser,
                receiver: recipientUser,
                message: arg.data?.message,
                timestamp: arg.data?.timestamp,
              })
            ).unwrap();
            // update messages cache pessimistically start
            dispatch(
              messageApi.util.updateQueryData(
                "getMessages",
                res.conversationId,
                (draft) => {
                  const messages = draft.filter(
                    (message) => message.id === res.id
                  );
                  if (messages.length > 0) {
                    return draft;
                  } else if (messages.length === 0) {
                    draft.push(res);
                  }
                }
              )
            );
            // update messages cache pessimistically end
          }
        } catch (error) {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationApi;

export default conversationApi;
