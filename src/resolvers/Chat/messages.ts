import { ChatMessage } from "../../models";
import type { ChatResolvers } from "../../types/generatedGraphQLTypes";
import * as cryptolib from "crypto";
/**
 * This resolver function will fetch and return the list of all messages in specified Chat from database.
 * @param parent - An object that is the return value of the resolver for this field's parent.
 * @returns An `object` that contains the list of messages.
 */
export const messages: ChatResolvers["messages"] = async (
  parent,
  _args,
  context,
) => {
  let messages = await ChatMessage.find({
    _id: {
      $in: parent.messages,
    },
  }).lean();

  messages = messages.map((message) => {
    let decryptedMessage = "";
    if (message.messageContent) {
      const [ivHex, encryptedContent] = message.messageContent.split(":");
      const iv = Buffer.from(ivHex, "hex");

      if (!process.env.ENCRYPTION_KEY) {
        throw new Error(
          "ENCRYPTION_KEY is not defined in environment variables.",
        );
      }
      const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

      // Create decipher instance
      const decipher = cryptolib.createDecipheriv("aes-256-cbc", key, iv);

      // Decrypt the content
      decryptedMessage = decipher.update(encryptedContent, "hex", "utf8");
      decryptedMessage += decipher.final("utf8");
    }
    if (message.media) {
      return { ...message, media: `${context.apiRootUrl}${message.media}` };
    }

    if (message.messageContent) {
      return { ...message, messageContent: decryptedMessage };
    }

    return message;
  });
  return messages;
};
