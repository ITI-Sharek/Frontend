import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listContributionRequests } from "../../services/contribution-requests.service";
import { contributionRequestsQueryKeys } from "../query-keys";
import type { ContributionRequestFeedFiltersDto } from "../../types/contribution-request.types";

export function useContributionRequestsQuery(
  filters: ContributionRequestFeedFiltersDto = {},
) {
  return useQuery({
    queryKey: contributionRequestsQueryKeys.feed(filters),
    queryFn: () => listContributionRequests(filters),
    placeholderData: keepPreviousData,
  });
}
