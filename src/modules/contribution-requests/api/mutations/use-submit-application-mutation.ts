import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitApplication } from "../../services/applications.service";
import { applicationsQueryKeys, contributionRequestsQueryKeys } from "../query-keys";
import type { SubmitApplicationParams } from "../../types/application.types";

export function useSubmitApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contributionRequestId,
      params,
    }: {
      contributionRequestId: string;
      params: SubmitApplicationParams;
    }) => submitApplication(contributionRequestId, params),
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
