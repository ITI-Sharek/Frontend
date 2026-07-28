import { useQuery } from "@tanstack/react-query";

import { getOwnerApplications } from "../../services/applications.service";
import { contributionRequestsQueryKeys } from "../query-keys";

/** Owner queue: every `PENDING_OWNER_REVIEW` Application, visible immediately. */
export function useOwnerApplicationsQuery(contributionRequestId: string) {
  return useQuery({
    queryKey:
      contributionRequestsQueryKeys.ownerApplications(contributionRequestId),
    queryFn: () => getOwnerApplications(contributionRequestId),
    enabled: contributionRequestId !== "",
  });
}
