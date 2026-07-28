import { useQuery } from "@tanstack/react-query";

import { getContributionRequestById } from "../../services/contribution-requests.service";
import { contributionRequestsQueryKeys } from "../query-keys";

export function useContributionRequestDetailsQuery(
  contributionRequestId: string,
) {
  return useQuery({
    queryKey: contributionRequestsQueryKeys.details(contributionRequestId),
    queryFn: () => getContributionRequestById(contributionRequestId),
    enabled: contributionRequestId !== "",
    retry: false,
  });
}
