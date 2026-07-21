import { useQuery } from "@tanstack/react-query";

import { getDiscussionPost } from "../../services/discussions.service";
import { discussionsQueryKeys } from "../query-keys";

export function useDiscussionPostQuery(postId: string) {
  return useQuery({
    queryKey: discussionsQueryKeys.detail(postId),
    queryFn: () => getDiscussionPost(postId),
  });
}
