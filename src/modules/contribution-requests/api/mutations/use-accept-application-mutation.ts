import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptApplication } from "../../services/applications.service";
import { applicationsQueryKeys, contributionRequestsQueryKeys } from "../query-keys";

/**
 * Explicit human Owner Decision: acceptance creates an Assignment and moves
 * sibling pending Applications to `NOT_SELECTED` — never an AI verdict.
 */
export function useAcceptApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptApplication,
    onSuccess: ({ application }) => {
      void queryClient.invalidateQueries({
        queryKey: contributionRequestsQueryKeys.ownerApplications(
          application.contributionRequestId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: contributionRequestsQueryKeys.details(
          application.contributionRequestId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: applicationsQueryKeys.all,
      });
    },
  });
}
