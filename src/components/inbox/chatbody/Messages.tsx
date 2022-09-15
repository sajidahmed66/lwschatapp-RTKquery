import { useAppSelector } from "../../../app/hooks";
import { IMessagesObj } from "../../../features/messages/messageApi";
import Message from "./Message";

interface IMessageProps {
  messages: IMessagesObj[];
}

export default function Messages({ messages }: IMessageProps) {
  const { user } = useAppSelector((state) => state.auth) || {};
  const { email } = user || {};
  console.log(messages);
  return (
    <div className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse">
      <ul className="space-y-2">
        {messages
          .slice()
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((message) => {
            const { message: lastMessage, id, sender } = message;
            const justify = sender.email !== email ? "start" : "end";
            return (
              <>
                <Message key={id} justify={justify} message={lastMessage} />
              </>
            );
          })}
      </ul>
    </div>
  );
}
