import { useQuery } from "@tanstack/react-query";

import { getRecommendedTasks } from "../../services/matching.service";
import { matchingQueryKeys } from "../query-keys";

export function useRecommendedTasksQuery() {
  return useQuery({
    queryKey: matchingQueryKeys.recommendations,
    queryFn: getRecommendedTasks,
    retry: false,
  });
}
