import { useMutation, useQueryClient } from "@tanstack/react-query";

import { withdrawApplication } from "../../services/applications.service";
import { applicationsQueryKeys, contributionRequestsQueryKeys } from "../query-keys";

export function useWithdrawApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      withdrawApplication(applicationId),
    onSuccess: (application) => {
      void queryClient.invalidateQueries({
        queryKey: applicationsQueryKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: contributionRequestsQueryKeys.ownerApplications(
          application.contributionRequestId,
        ),
      });
    },
  });
}
