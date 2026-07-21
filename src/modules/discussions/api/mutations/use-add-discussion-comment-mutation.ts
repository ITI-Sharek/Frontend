import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addDiscussionComment } from "../../services/discussions.service";
import { discussionsQueryKeys } from "../query-keys";
import type { DiscussionPostDetailDto } from "../../types/discussion.types";

export function useAddDiscussionCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDiscussionComment,
    onSuccess: (post: DiscussionPostDetailDto) => {
      queryClient.setQueryData(discussionsQueryKeys.detail(post.id), post);
      void queryClient.invalidateQueries({ queryKey: discussionsQueryKeys.list() });
    },
  });
}
