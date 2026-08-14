import { useQuery } from "@tanstack/react-query";

import { getEligibilityGuidance } from "../../services/eligibility.service";
import { eligibilityQueryKeys } from "../query-keys";

/**
 * Polls one piece of guidance until it settles.
 *
 * Polling rather than streaming because the block response deliberately does
 * not wait on the provider: the deterministic reason is already on screen, and
 * the narrative is an addition that arrives when it arrives.
 */
export function useEligibilityGuidanceQuery(guidanceId: string | null) {
  return useQuery({
    queryKey: eligibilityQueryKeys.guidance(guidanceId ?? "none"),
    queryFn: () => getEligibilityGuidance(guidanceId as string),
    enabled: Boolean(guidanceId),
    // Stops as soon as the row settles, so a failed generation does not poll
    // forever against a provider that is down.
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 3_000 : false,
  });
}
