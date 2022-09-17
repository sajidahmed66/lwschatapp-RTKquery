import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import conversationApi, {
  IConversation,
  useAddConversationMutation,
  useEditConversationMutation,
} from "../../features/conversations/conversationApi";
import { useGetUserQuery } from "../../features/user/userApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from "../ui/Error";
export interface IModalProps {
  open: boolean;
  control: () => void;
}

const Modal = ({ open, control }: IModalProps) => {
  const [to, setTo] = useState(""); // email
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userCheck, setuserCheck] = useState(false);
  const [conversation, setConversation] = useState<IConversation[] | undefined>(
    undefined
  );
  const { user: loggedInUser } = useAppSelector((state) => state.auth) || {};
  const dispatch = useAppDispatch();
  const { email: myEmail } = loggedInUser || {};
  const { data: participant } = useGetUserQuery(to, { skip: !userCheck }) || {};

  const [addConversation, { isSuccess: isAddConversationSuccess }] =
    useAddConversationMutation();
  const [editConversation, { isSuccess: isEditConversationSuccess }] =
    useEditConversationMutation();

  useEffect(() => {
    if (
      participant &&
      participant?.length > 0 &&
      participant[0].email !== myEmail
    ) {
      //check if conversation exists
      dispatch(
        conversationApi.endpoints.getConversation.initiate({
          userEmail: myEmail as string,
          participantEmail: to,
        })
      )
        .unwrap()
        .then((res) => {
          setConversation(res);
        })
        .catch((err) => {
          setError("failed to get conversations");
        });
    }
  }, [participant, dispatch, to, myEmail]);

  useEffect(() => {
    if (isAddConversationSuccess || isEditConversationSuccess) {
      control();
    }
  }, [isAddConversationSuccess, isEditConversationSuccess]);

  const debounced = (fn: Function, ms: number) => {
    let timeoutId: NodeJS.Timeout | undefined;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, ms);
    };
  };

  const updateTo = (value: string) => {
    if (isValidEmail(value)) {
      console.log("varified");
      setTo(value);
      setuserCheck(true);
    }
  };

  const handleEmailWithdebounce = (e: React.ChangeEvent<HTMLInputElement>) =>
    debounced((value: string) => updateTo(value), 1000)(e.target.value);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (conversation && conversation?.length > 0) {
      //editConversation
      console.log("from submitted", {
        id: conversation[0].id,
        data: {
          participants: `${myEmail}-${
            participant && participant?.length > 0 && participant[0].email
          }`,
          users: [
            loggedInUser,
            participant && participant?.length > 0 && participant[0],
          ],
          message,
          timestamp: new Date().getTime(),
        },
      });
      editConversation({
        id: conversation[0].id,
        data: {
          participants: `${myEmail}-${
            participant && participant?.length > 0 && participant[0].email
          }`,
          users: [
            loggedInUser,
            participant && participant?.length > 0 && participant[0],
          ],
          message,
          timestamp: new Date().getTime(),
        },
      });
    } else if (conversation?.length === 0) {
      //addConversation
      addConversation({
        participants: `${myEmail}-${
          participant && participant?.length > 0 && participant[0].email
        }`,
        users: [
          loggedInUser,
          participant && participant?.length > 0 && participant[0],
        ],
        message,
        timestamp: new Date().getTime(),
      });
    }
  };

  return open ? (
    <>
      <div
        onClick={control}
        className="fixed inset-0 z-10 w-full h-full cursor-pointer bg-black/50"
      ></div>
      <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Send message
        </h2>
        <form className="mt-8 space-y-6" method="POST" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="to" className="sr-only">
                To
              </label>
              <input
                id="to"
                name="to"
                type="email"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Send to"
                // value={to}
                onChange={(e) => handleEmailWithdebounce(e)}
              />
            </div>
            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                // type="message"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Message"
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              disabled={
                conversation === undefined ||
                (participant &&
                  participant?.length > 0 &&
                  participant[0].email === myEmail)
              }
              // disabled={true}
            >
              Send Message
            </button>
          </div>

          {participant?.length === 0 ? (
            <Error message="No matched email " />
          ) : (
            <></>
          )}
          {participant &&
          participant?.length > 0 &&
          participant[0].email === myEmail ? (
            <Error message="You cannot send message to yourSelf " />
          ) : (
            <></>
          )}
          {error ? <Error message={error} /> : <></>}
        </form>
      </div>
    </>
  ) : (
    <></>
  );
};

export default Modal;
