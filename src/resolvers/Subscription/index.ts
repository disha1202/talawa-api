import type { SubscriptionResolvers } from "../../types/generatedGraphQLTypes";
import { directMessageChat } from "./directMessageChat";
import { messageSentToChat } from "./messageSentToChat";
import { generateNotification } from "./generateNotification";
import { onPluginUpdate } from "./onPluginUpdate";
export const Subscription: SubscriptionResolvers = {
  directMessageChat,
  messageSentToChat,
  onPluginUpdate,
  generateNotification,
};
