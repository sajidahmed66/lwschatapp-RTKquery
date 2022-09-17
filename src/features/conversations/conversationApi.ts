import { apiSlice } from "../api/apiSlice";
import messageApi, { IMessagesObj } from "../messages/messageApi";

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
    getConversations: builder.query<IConversation[], string>({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATION_PER_PAGE}`,
      }),
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
              const draftConversation = draft.find((c) => c.id == arg.id);
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
                  draft.push(res);
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
