import { useQuery } from "@tanstack/react-query";

import { listDiscussionPosts } from "../../services/discussions.service";
import { discussionsQueryKeys } from "../query-keys";

export function useDiscussionPostsQuery() {
  return useQuery({
    queryKey: discussionsQueryKeys.list(),
    queryFn: listDiscussionPosts,
  });
}
