import { useQuery } from "@tanstack/react-query";

import { getAdvisoryFit } from "../../services/applications.service";
import { applicationsQueryKeys } from "../query-keys";

/** Owner-only Advisory Fit state for one Application. */
export function useAdvisoryFitQuery(applicationId: string) {
  return useQuery({
    queryKey: applicationsQueryKeys.assessment(applicationId),
    queryFn: () => getAdvisoryFit(applicationId),
    enabled: applicationId !== "",
    retry: false,
  });
}
