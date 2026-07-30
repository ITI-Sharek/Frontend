import { useMutation, useQueryClient } from "@tanstack/react-query";

import { withdrawApplication } from "../../services/applications.service";
import { applicationsQueryKeys, contributionRequestsQueryKeys } from "../query-keys";
import type { WithdrawApplicationParams } from "../../types/application.types";

export function useWithdrawApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      idempotencyKey,
    }: WithdrawApplicationParams) =>
      withdrawApplication(applicationId, idempotencyKey),
    onSuccess: (application) => {
      queryClient.setQueryData(
        applicationsQueryKeys.detail(application.id),
        application,
      );
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
