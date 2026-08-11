import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateOwnerMatches,
  inviteMatchedContributor,
} from "../../services/matching.service";
import { matchingQueryKeys } from "../query-keys";

export function useGenerateOwnerMatchesMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateOwnerMatches(requestId),
    onSuccess: (response) => {
      queryClient.setQueryData(matchingQueryKeys.owner(requestId), response);
    },
  });
}

export function useInviteMatchedContributorMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contributorId: string) =>
      inviteMatchedContributor(requestId, contributorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: matchingQueryKeys.owner(requestId),
      });
    },
  });
}
