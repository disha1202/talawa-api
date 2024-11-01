import type { MutationResolvers } from "../../types/generatedGraphQLTypes";
import { errors, requestContext } from "../../libraries";
import { Chat, User, ChatMessage } from "../../models";
import { CHAT_NOT_FOUND_ERROR, USER_NOT_FOUND_ERROR } from "../../constants";
import { uploadEncodedImage } from "../../utilities/encodedImageStorage/uploadEncodedImage";
import { uploadEncodedVideo } from "../../utilities/encodedVideoStorage/uploadEncodedVideo";
import * as cryptolib from "crypto";

/**
 * This function enables to send message to chat.
 * @param _parent - parent of current request
 * @param args - payload provided with the request
 * @param context - context of entire application
 * @remarks The following checks are done:
 * 1. If the direct chat exists.
 * 2. If the user exists
 * @returns  Chat message.
 */
export const sendMessageToChat: MutationResolvers["sendMessageToChat"] = async (
  _parent,
  args,
  context,
) => {
  const chat = await Chat.findOne({
    _id: args.chatId,
  }).lean();

  if (!chat) {
    throw new errors.NotFoundError(
      requestContext.translate(CHAT_NOT_FOUND_ERROR.MESSAGE),
      CHAT_NOT_FOUND_ERROR.CODE,
      CHAT_NOT_FOUND_ERROR.PARAM,
    );
  }

  const currentUserExists = !!(await User.exists({
    _id: context.userId,
  }));

  if (currentUserExists === false) {
    throw new errors.NotFoundError(
      requestContext.translate(USER_NOT_FOUND_ERROR.MESSAGE),
      USER_NOT_FOUND_ERROR.CODE,
      USER_NOT_FOUND_ERROR.PARAM,
    );
  }

  const now = new Date();

  let mediaFile = null;

  if (args.media) {
    const dataUrlPrefix = "data:";
    if (args.media.startsWith(dataUrlPrefix + "image/")) {
      mediaFile = await uploadEncodedImage(args.media, null);
    } else if (args.media.startsWith(dataUrlPrefix + "video/")) {
      mediaFile = await uploadEncodedVideo(args.media, null);
    } else {
      throw new Error("Unsupported file type.");
    }
  }

  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
  }
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  if (!process.env.ENCRYPTION_IV) {
    throw new Error("ENCRYPTION_IV is not defined in environment variables.");
  }
  const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");

  let encryptedMessage = "";

  // Encrypt message content if present
  if (args.messageContent) {
    const cipher = cryptolib.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(args.messageContent, "utf8", "hex");
    encrypted += cipher.final("hex");
    encryptedMessage = `${iv.toString("hex")}:${encrypted}`;
  }

  const createdChatMessage = await ChatMessage.create({
    chatMessageBelongsTo: chat._id,
    sender: context.userId,
    messageContent: encryptedMessage,
    media: mediaFile,
    replyTo: args.replyTo,
    createdAt: now,
    updatedAt: now,
  });

  const unseenMessagesByUsers = JSON.parse(
    chat.unseenMessagesByUsers as unknown as string,
  );

  Object.keys(unseenMessagesByUsers).map((user: string) => {
    if (user !== context.userId) {
      unseenMessagesByUsers[user] += 1;
    }
  });

  // add createdDirectChatMessage to directChat
  await Chat.updateOne(
    {
      _id: chat._id,
    },
    {
      $push: {
        messages: createdChatMessage._id,
      },
      $set: {
        unseenMessagesByUsers: JSON.stringify(unseenMessagesByUsers),
        updatedAt: now,
      },
    },
  );

  // calls subscription
  context.pubsub.publish("MESSAGE_SENT_TO_CHAT", {
    messageSentToChat: createdChatMessage.toObject(),
  });

  return {
    ...createdChatMessage.toObject(),
    messageContent: args.messageContent || "",
  };
};
