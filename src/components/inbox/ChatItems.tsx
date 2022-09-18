import { useAppDispatch, useAppSelector } from "../../app/hooks";
import conversationApi, {
  IConversation,
  useGetConversationsQuery,
} from "../../features/conversations/conversationApi";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import moment from "moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

export default function ChatItems() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useAppDispatch();
  const { user: loggedInUser } = useAppSelector((state) => state.auth) || {};
  const {
    isLoading,
    data: modifiedData,
    isError,
    error,
  } = useGetConversationsQuery(loggedInUser?.email as string);
  const data = modifiedData?.data as IConversation[];
  const totalCount = modifiedData?.totalCount;
  //decide what to render

  const fetchMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (page > 1) {
      dispatch(
        conversationApi.endpoints.getUpdatedQueryConversations.initiate({
          email: loggedInUser?.email as string,
          page,
        })
      );
    }
  }, [page]);

  useEffect(() => {
    if (totalCount && totalCount > 0) {
      const more =
        Math.ceil(
          totalCount / Number(process.env.REACT_APP_CONVERSATION_PER_PAGE)
        ) > page;
      setHasMore(more);
    }
  }, [hasMore, page]);

  let content = null;

  if (isLoading) {
    content = (
      <svg
        role="img"
        width="400"
        height="160"
        aria-labelledby="loading-aria"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
      >
        <title id="loading-aria">Loading...</title>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          clipPath="url(#clipPath)"
          // style='fill: url("#fill");'
        ></rect>
        <defs>
          <clipPath id="clipPath">
            <rect x="48" y="8" rx="3" ry="3" width="88" height="6" />
            <rect x="48" y="26" rx="3" ry="3" width="52" height="6" />
            <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
            <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
            <rect x="0" y="88" rx="3" ry="3" width="178" height="6" />
            <circle cx="20" cy="20" r="20" />
          </clipPath>
          <linearGradient id="fill">
            <stop offset="0.599964" stopColor="#f3f3f3" stopOpacity="1">
              <animate
                attributeName="offset"
                values="-2; -2; 1"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              ></animate>
            </stop>
            <stop offset="1.59996" stopColor="#ecebeb" stopOpacity="1">
              <animate
                attributeName="offset"
                values="-1; -1; 2"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              ></animate>
            </stop>
            <stop offset="2.59996" stopColor="#f3f3f3" stopOpacity="1">
              <animate
                attributeName="offset"
                values="0; 0; 3"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              ></animate>
            </stop>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (!isLoading && isError) {
    let errorMessage = "";
    if (error) {
      if ("status" in error) {
        errorMessage =
          "error" in error ? error.error : JSON.stringify(error.data);
      }
    }
    content = (
      <li className="ml-2">
        <Error message={errorMessage} />
      </li>
    );
  }
  if (!isLoading && !isError && data?.length === 0) {
    content = <li className="ml-2">no conversation found</li>;
  } else if (!isLoading && !isError && (data?.length as number) > 0) {
    content = (
      <InfiniteScroll
        dataLength={data?.length as number} //This is important field to render the next data
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        height={window.innerHeight - 129}
        // endMessage={
        //   <p style={{ textAlign: 'center' }}>
        //     <b>Yay! You have seen it all</b>
        //   </p>
        // }
        // // below props only if you need pull down functionality
        // refreshFunction={this.refresh}
        // pullDownToRefresh
        // pullDownToRefreshThreshold={50}
        // pullDownToRefreshContent={
        //   <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
        // }
        // releaseToRefreshContent={
        //   <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
        // }
      >
        {data?.map((conversation) => {
          const { email: partnerEmail, name: partnerName } = getPartnerInfo(
            conversation.users,
            loggedInUser?.email as string
          );
          return (
            <li key={conversation.id}>
              <Link to={`/inbox/${conversation.id}`}>
                <ChatItem
                  avatar={gravatarUrl(partnerEmail, { size: 80 })}
                  name={partnerName}
                  lastMessage={conversation.message}
                  lastTime={moment(conversation.timestamp).fromNow()}
                />
              </Link>
            </li>
          );
        })}
      </InfiniteScroll>
    );
  }
  return <ul>{content}</ul>;
}
