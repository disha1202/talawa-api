import type { SubscriptionResolvers } from "../../types/generatedGraphQLTypes";
import { withFilter } from "graphql-subscriptions";

// import { Chat } from "../../models";

const GENERATE_NOTIFICATION = "GENERATE_NOTIFICATION";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterFunction = async function (
  payload: any,
  variables: any,
): Promise<boolean> {
    console.log(variables.userId, payload.generateNotification.toUserId, payload.generateNotification.fromUserId);

  if(variables.userId === payload.generateNotification.toUserId.toString() || variables.userId === payload.generateNotification.fromUserId.toString()) {
    console.log("filter Passed");
    console.log("variables", variables);
    return true;
  } else {
    console.log("filter Failed");
    return false;
  }
};
/**
 * This property included a `subscribe` method, which is used to
 * subscribe the `receiver` and `sender` to receive Chat updates.
 *
 * @remarks To control updates on a per-client basis, the function uses the `withFilter`
 * method imported from `apollo-server-express` module.
 * You can learn about `subscription` {@link https://www.apollographql.com/docs/apollo-server/data/subscriptions/ | here }.
 */
export const generateNotification: SubscriptionResolvers["generateNotification"] = {
     // @ts-expect-error-ts-ignore
     subscribe: withFilter(
        (_parent, _args, context) => {
          console.log("Subscription initialized.");
          const iterator = context.pubsub.asyncIterator([GENERATE_NOTIFICATION]);
          console.log("Iterator created:", iterator);
          return iterator;
        },
        (payload, variables) => filterFunction(payload, variables)
      ),
      
};
