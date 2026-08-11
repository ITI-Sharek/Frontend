import { useQuery } from "@tanstack/react-query";

import { getOwnerMatches, getRecommendedTasks } from "../../services/matching.service";
import { matchingQueryKeys } from "../query-keys";

export function useOwnerMatchesQuery(requestId: string) {
  return useQuery({
    queryKey: matchingQueryKeys.owner(requestId),
    queryFn: () => getOwnerMatches(requestId),
    enabled: requestId !== "",
    retry: false,
  });
}

export function useRecommendedTasksQuery() {
  return useQuery({
    queryKey: matchingQueryKeys.recommendations,
    queryFn: getRecommendedTasks,
    retry: false,
  });
}
