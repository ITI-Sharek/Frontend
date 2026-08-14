import { useMutation } from "@tanstack/react-query";

import { requestEligibilityGuidance } from "../../services/eligibility.service";

export function useRequestEligibilityGuidanceMutation() {
  return useMutation({ mutationFn: requestEligibilityGuidance });
}
