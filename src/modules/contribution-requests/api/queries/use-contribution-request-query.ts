import { useQuery } from "@tanstack/react-query";

import { getContributionRequest } from "../../services/contribution-requests.service";
import { contributionRequestKeys } from "../query-keys";

export function useContributionRequestQuery(requestId: string) {
  return useQuery({
    queryKey: contributionRequestKeys.detail(requestId),
    queryFn: () => getContributionRequest(requestId),
    retry: false,
  });
}
