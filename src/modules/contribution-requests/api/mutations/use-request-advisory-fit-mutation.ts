import { useMutation, useQueryClient } from "@tanstack/react-query";

import { requestAdvisoryFit } from "../../services/applications.service";
import { applicationsQueryKeys } from "../query-keys";

export function useRequestAdvisoryFitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestAdvisoryFit,
    onSuccess: (assessment, { applicationId }) => {
      queryClient.setQueryData(
        applicationsQueryKeys.assessment(applicationId),
        assessment,
      );
    },
  });
}
