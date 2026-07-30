import { useMutation, useQueryClient } from "@tanstack/react-query";

import { declineApplication } from "../../services/applications.service";
import { applicationsQueryKeys, contributionRequestsQueryKeys } from "../query-keys";
/** Explicit human Owner Decision: decline with a reason kept separate from any AI finding. */
export function useDeclineApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declineApplication,
    onSuccess: ({ application }) => {
      queryClient.setQueryData(
        applicationsQueryKeys.detail(application.id),
        application,
      );
      void queryClient.invalidateQueries({
        queryKey: contributionRequestsQueryKeys.ownerApplications(
          application.contributionRequestId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: applicationsQueryKeys.all,
      });
    },
  });
}
