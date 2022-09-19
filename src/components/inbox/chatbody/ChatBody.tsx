// import Blank from "./Blank";
import { useParams } from "react-router-dom";
import {
  IMessagesObj,
  useGetMessagesQuery,
} from "../../../features/messages/messageApi";
import Error from "../../ui/Error";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";

export default function ChatBody() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetMessagesQuery(
    parseInt(id as string)
  );

  //decide ehat to render
  let content = null;
  if (isLoading) {
    content = <div>loading....</div>;
  }
  if (!isLoading && isError) {
    let errorMessage = "";
    if (error) {
      if ("status" in error) {
        errorMessage =
          "error" in error ? error.error : JSON.stringify(error.data);
      }
    }
    content = <Error message={errorMessage} />;
  } else if (!isLoading && !isError && data?.data.length === 0) {
    content = <div>no messages found</div>;
  } else if (
    !isLoading &&
    !isError &&
    data &&
    (data?.data.length as number) > 0
  ) {
    content = (
      <>
        <ChatHead message={data.data[0]} />
        <Messages
          messages={data.data as IMessagesObj[]}
          totalCount={data.totalCount}
        />
        <Options info={data.data[0]} />
      </>
    );
  }
  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="grid w-full conversation-row-grid">
        {/* <ChatHead
          avatar="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
          name="Akash Ahmed"
        />
        <Messages />
        <Options /> */}
        {content}
        {/* <Blank /> */}
      </div>
    </div>
  );
}
