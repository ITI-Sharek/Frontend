import { useMutation, useQueryClient } from "@tanstack/react-query";

import { presentAdvisoryFit } from "../../services/applications.service";
import { applicationsQueryKeys } from "../query-keys";

/**
 * Records the owner's first presentation of a completed assessment.
 *
 * The read no longer writes this, so without an explicit call `presentedAt`
 * stays null forever and the presentation audit trail goes dead.
 */
export function usePresentAdvisoryFitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => presentAdvisoryFit(applicationId),
    onSuccess: (assessment, applicationId) => {
      queryClient.setQueryData(
        applicationsQueryKeys.assessment(applicationId),
        assessment,
      );
    },
  });
}
