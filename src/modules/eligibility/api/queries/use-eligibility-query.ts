import { useQuery } from "@tanstack/react-query";

import { getContributionRequestEligibility } from "../../services/eligibility.service";
import { eligibilityQueryKeys } from "../query-keys";

export function useContributionRequestEligibilityQuery(
  contributionRequestId: string,
) {
  return useQuery({
    queryKey: eligibilityQueryKeys.forRequest(contributionRequestId),
    queryFn: () => getContributionRequestEligibility(contributionRequestId),
    // Advisory by design: the backend recomputes the verdict inside the
    // submission transaction and this answer is never trusted there. Kept
    // fresh-ish so an approval granted in another tab shows up, but the
    // authoritative check is the 403 path.
    staleTime: 30_000,
  });
}
