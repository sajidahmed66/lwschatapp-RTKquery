import { IUserObjectInConversation } from "../features/conversations/conversationApi";

const getPartnerInfo = (
  userArr: IUserObjectInConversation[],
  email: string
): IUserObjectInConversation => {
  return userArr.filter(
    (user) => user.email !== email
  )[0] as IUserObjectInConversation;
};

export default getPartnerInfo;
