import { useAppSelector } from "../../../app/hooks";
import { IMessagesObj } from "../../../features/messages/messageApi";
import gravatarUrl from "gravatar-url";
export interface IChatHeadProps {
  message: IMessagesObj;
}

export default function ChatHead({ message }: IChatHeadProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { email: userEmail } = user || {};
  const { sender, receiver } = message;
  const partnerEmail = sender.email === userEmail ? receiver : sender;

  const avatar = gravatarUrl(partnerEmail.email, { size: 80 });

  return (
    <div className="relative flex items-center p-3 border-b border-gray-300">
      <img
        className="object-cover w-10 h-10 rounded-full"
        src={avatar}
        alt={partnerEmail.name}
      />
      <span className="block ml-2 font-bold text-gray-600">
        {partnerEmail.name}
      </span>
    </div>
  );
}
