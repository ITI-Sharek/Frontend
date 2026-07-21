import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDiscussionPost } from "../../services/discussions.service";
import { discussionsQueryKeys } from "../query-keys";

export function useCreateDiscussionPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiscussionPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: discussionsQueryKeys.list() });
    },
  });
}
