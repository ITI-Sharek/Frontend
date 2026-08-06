import { useQuery } from "@tanstack/react-query";

import { getAdvisoryFit } from "../../services/applications.service";
import type { AdvisoryFitAssessmentDto } from "../../types/advisory-fit.types";
import { applicationsQueryKeys } from "../query-keys";

export const ADVISORY_FIT_POLL_INTERVAL_MS = 3000;

/**
 * REQUESTED is the only state the backend resolves on its own; every other
 * status is terminal until the owner acts.
 *
 * Polling anything else would be costly rather than merely useless: this panel
 * renders for every Application in the owner's list, not behind a disclosure,
 * so a wrong predicate here means one request per Application per interval,
 * indefinitely.
 */
export function advisoryFitRefetchInterval(
  data: AdvisoryFitAssessmentDto | undefined,
): number | false {
  return data?.requestStatus === "REQUESTED"
    ? ADVISORY_FIT_POLL_INTERVAL_MS
    : false;
}

/** Owner-only Advisory Fit state for one Application. */
export function useAdvisoryFitQuery(applicationId: string) {
  return useQuery({
    queryKey: applicationsQueryKeys.assessment(applicationId),
    queryFn: () => getAdvisoryFit(applicationId),
    enabled: applicationId !== "",
    retry: false,
    refetchInterval: (query) => advisoryFitRefetchInterval(query.state.data),
  });
}
