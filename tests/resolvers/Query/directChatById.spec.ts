import "dotenv/config";
import type mongoose from "mongoose";
import { Types } from "mongoose";
import { connect, disconnect } from "../../helpers/db";

import { directChatById as directChatByIdResolver } from "../../../src/resolvers/Query/directChatById";
import { DirectChat } from "../../../src/models";
import type { QueryDirectChatsByUserIdArgs } from "../../../src/types/generatedGraphQLTypes";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createTestDirectChat,  TestDirectChatType} from "../../helpers/directChat";
import type { TestUserType,  } from "../../helpers/userAndOrg";

let testUser: TestUserType;
let testDirectChat: TestDirectChatType
let MONGOOSE_INSTANCE: typeof mongoose;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const resultArray = await createTestDirectChat();
  testUser = resultArray[0];
  testDirectChat = resultArray[2];
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolvers -> Query -> directChatsById", () => {
  it(`throws NotFoundError if no directChats exists with directChats._id === args.id`, async () => {
    try {
      const args: QueryDirectChatsByUserIdArgs = {
        id: new Types.ObjectId().toString(),
      };

      await directChatByIdResolver?.({}, args, {});
    } catch (error: unknown) {
      expect((error as Error).message).toEqual("DirectChats not found");
    }
  });

  it(`returns list of all directChats with directChat.users containing the user
  with _id === args.id`, async () => {
    const args: QueryDirectChatsByUserIdArgs = {
      id: testDirectChat?._id,
    };

    const directChatsByUserIdPayload = await directChatByIdResolver?.(
      {},
      args,
      {},
    );

    const directChatsByUserId = await DirectChat.find({
      users: testDirectChat?._id,
    }).lean();

    expect(directChatsByUserIdPayload).toEqual(directChatsByUserId);
  });
});
