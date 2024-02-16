import type { OrganizationResolvers } from "../../types/generatedGraphQLTypes";
import { admins } from "./admins";
import { blockedUsers } from "./blockedUsers";
import { creator } from "./creator";
import { image } from "./image";
import { members } from "./members";
import { pinnedPosts } from "./pinnedPosts";
import { membershipRequests } from "./membershipRequests";
import { actionItemCategories } from "./actionItemCategories";
import { advertisements } from "./advertisements";
// import { userTags } from "./userTags";

export const Organization: OrganizationResolvers = {
  admins,
  advertisements,
  actionItemCategories,
  blockedUsers,
  creator,
  image,
  members,
  membershipRequests,
  pinnedPosts,
  // userTags,
};
