import type { Types, Model } from "mongoose";
import { Schema, model, models } from "mongoose";

import { createLoggingMiddleware } from "../libraries/dbLogger";
/**
 * Interface representing a document for direct chat in MongoDB.
 */
export interface InterfaceNotificationTemplate {
  _id: Types.ObjectId;
  title: string;
  channel: string;
  content: string;
  type: string;
  name: string;
  linkRouteName: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    channel: {
      type: String,
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
    content: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    linkRouteName: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  },
);

// Add logging middleware for notificationTemplateSchema
createLoggingMiddleware(notificationTemplateSchema, "NotificationTemplate");

/**
 * Retrieves or creates the Mongoose model for NotificationTemplate.
 * Prevents Mongoose OverwriteModelError during testing.
 */
const notificationTemplateModel = (): Model<InterfaceNotificationTemplate> =>
  model<InterfaceNotificationTemplate>("NotificationTemplate", notificationTemplateSchema);

// This syntax is needed to prevent Mongoose OverwriteModelError while running tests.
export const NotificationTemplate = (models.NotificationTemplate || notificationTemplateModel()) as ReturnType<
  typeof notificationTemplateModel
>;
