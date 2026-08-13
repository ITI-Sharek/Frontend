import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendAssignmentMessage } from "../../services/assignment-conversations.service";
import { assignmentConversationKeys } from "../query-keys";

export function useSendAssignmentMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendAssignmentMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentConversationKeys.messageLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: assignmentConversationKeys.list(),
      });
    },
  });
}
