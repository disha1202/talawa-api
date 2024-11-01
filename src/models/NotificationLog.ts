import type { Types, Model, PopulatedDoc } from "mongoose";
import { Schema, model, models } from "mongoose";

import { createLoggingMiddleware } from "../libraries/dbLogger";
import type { InterfaceUser } from "./User";
import type { InterfaceOrganization } from "./Organization";
import type { InterfaceNotificationTemplate } from "./NotificationTemplate";
/**
 * Interface representing a document for direct chat in MongoDB.
 */
export interface InterfaceNotificationLog {
  _id: Types.ObjectId;
  toUserId: PopulatedDoc<InterfaceUser & Document>;
  fromUserId: PopulatedDoc<InterfaceUser & Document>;
  notificationTemplateId: PopulatedDoc<InterfaceNotificationTemplate & Document>;
  toOrganizationId: PopulatedDoc<InterfaceOrganization & Document>;
  fromOrganizationId: PopulatedDoc<InterfaceUser & Document>;
  status: string;
  routeLinkParams: JSON;
  variables: JSON;
  createdAt: Date;
  updatedAt: Date;
}

const notificationLogSchema = new Schema(
  {
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    toOrganizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },
    fromOrganizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },
    notificationTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "NotificationTemplate",
      required: false,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    routeLinkParams: {
      type: JSON,
      required: false,
    },
    variables: {
      type: JSON,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Add logging middleware for notificationLogSchema
createLoggingMiddleware(notificationLogSchema, "NotificationLog");

/**
 * Retrieves or creates the Mongoose model for NotificationLog.
 * Prevents Mongoose OverwriteModelError during testing.
 */
const notificationLogModel = (): Model<InterfaceNotificationLog> =>
  model<InterfaceNotificationLog>("NotificationLog", notificationLogSchema);

// This syntax is needed to prevent Mongoose OverwriteModelError while running tests.
export const NotificationLog = (models.NotificationLog || notificationLogModel()) as ReturnType<
  typeof notificationLogModel
>;
