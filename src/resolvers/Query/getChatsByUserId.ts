import { GraphQLError } from "graphql";
import { MAXIMUM_FETCH_LIMIT } from "../../constants";
import type { InterfaceDirectChat, InterfaceGroupChat } from "../../models";
import { DirectChat, GroupChat } from "../../models";
import type { QueryResolvers } from "../../types/generatedGraphQLTypes";
import {
  getCommonGraphQLConnectionFilter,
  getCommonGraphQLConnectionSort,
  parseGraphQLConnectionArguments,
  transformToDefaultGraphQLConnection,
  type DefaultGraphQLArgumentError,
  type ParseGraphQLConnectionCursorArguments,
  type ParseGraphQLConnectionCursorResult,
} from "../../utilities/graphQLConnection";

export const getChatsByUserId: QueryResolvers["getChatsByUserId"] = async (
  _parent,
  args,
  context,
) => {
  const parseGraphQLConnectionArgumentsResult =
    await parseGraphQLConnectionArguments({
      args,
      parseCursor: (args) =>
        parseCursor({
          ...args,
        }),
      maximumLimit: MAXIMUM_FETCH_LIMIT,
    });

  if (!parseGraphQLConnectionArgumentsResult.isSuccessful) {
    throw new GraphQLError("Invalid arguments provided.", {
      extensions: {
        code: "INVALID_ARGUMENTS",
        errors: parseGraphQLConnectionArgumentsResult.errors,
      },
    });
  }

  const { parsedArgs } = parseGraphQLConnectionArgumentsResult;

  const filter = getCommonGraphQLConnectionFilter({
    cursor: parsedArgs.cursor,
    direction: parsedArgs.direction,
  });

  const sort = getCommonGraphQLConnectionSort({
    direction: parsedArgs.direction,
  });

  const [objectList, totalCount] = await Promise.all([
    {
      ...DirectChat.find({
        ...filter,
        users: args.id,
      })
        .sort(sort)
        .limit(parsedArgs.limit)
        .lean()
        .exec(),
      ...GroupChat.find({
        ...filter,
        users: args.id,
      })
        .sort(sort)
        .limit(parsedArgs.limit)
        .lean()
        .exec(),
    },
    (await GroupChat.find().countDocuments({ users: args.id }).exec()) +
      (await DirectChat.find({ users: args.id }).countDocuments().exec()),
  ]);

  return transformToDefaultGraphQLConnection<
    ParsedCursor,
    InterfaceDirectChat | InterfaceGroupChat,
    InterfaceDirectChat | InterfaceGroupChat
  >({
    objectList,
    parsedArgs,
    totalCount,
  });
};

/*
This is typescript type of the parsed cursor for this connection resolver.
*/
type ParsedCursor = string;

/*
This function is used to validate and transform the cursor passed to this connnection
resolver.
*/
export const parseCursor = async ({
  cursorValue,
  cursorName,
  cursorPath,
}: ParseGraphQLConnectionCursorArguments): ParseGraphQLConnectionCursorResult<ParsedCursor> => {
  const errors: DefaultGraphQLArgumentError[] = [];
  const chat =
    (await DirectChat.findOne({
      _id: cursorValue,
    })) ??
    (await GroupChat.findOne({
      _id: cursorValue,
    }));

  if (!chat) {
    errors.push({
      message: `Argument ${cursorName} is an invalid cursor.`,
      path: cursorPath,
    });
  }

  if (errors.length !== 0) {
    return {
      errors,
      isSuccessful: false,
    };
  }

  return {
    isSuccessful: true,
    parsedCursor: cursorValue,
  };
};
