import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import messageApi, {
  IMessagesObj,
} from "../../../features/messages/messageApi";
import Message from "./Message";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

interface IMessageProps {
  messages: IMessagesObj[];
  totalCount: number;
}

export default function Messages({ messages, totalCount }: IMessageProps) {
  const { user } = useAppSelector((state) => state.auth) || {};
  const { email } = user || {};
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const fetchMore = () => {
    console.log("Fetching more", page + 1, "length", messages?.length);
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (page > 1) {
      dispatch(
        messageApi.endpoints.getMoreMessages.initiate({
          id: messages[0].conversationId,
          page: page,
        })
      );
    }
  }, [page]);

  console.log(
    page,
    Math.ceil(totalCount / Number(process.env.REACT_APP_MESSAGES_PER_PAGE))
  );

  useEffect(() => {
    if (totalCount && totalCount > 0) {
      const more =
        Math.ceil(
          totalCount / Number(process.env.REACT_APP_MESSAGES_PER_PAGE)
        ) > page;
      setHasMore(more);
    }
  }, [hasMore, page]);

  return (
    <div className="relative w-full h-[calc(100vh_-_197px)] py-6 flex flex-col-reverse overflow-y-auto">
      <ul className="space-y-2 ">
        <InfiniteScroll
          dataLength={messages?.length as number} //This is important field to render the next data
          next={fetchMore}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          height={window.innerHeight - 300}
          className="flex flex-col-reverse px-6 pb-2"
        >
          {messages
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .reverse()
            .map((message) => {
              const { message: lastMessage, id, sender } = message;
              const justify = sender.email !== email ? "start" : "end";
              return (
                <Message key={id} justify={justify} message={lastMessage} />
              );
            })}
        </InfiniteScroll>
      </ul>
    </div>
  );
}
