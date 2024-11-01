import type { NotificationLogResolvers } from "../../types/generatedGraphQLTypes";
import { toUserId } from "./toUserId";
import { fromUserId } from "./fromUserId";
import { notificationTemplateId } from "./notificationTemplateId";

export const NotificationLog: NotificationLogResolvers = {
    toUserId,
    fromUserId,
    notificationTemplateId,
};