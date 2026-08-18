import { queryOptions, useQuery } from "@tanstack/react-query";

import { listProjectDifficulties } from "../../services/project-categories.service";
import { projectsQueryKeys } from "../query-keys";

export const projectDifficultiesQueryOptions = () =>
  queryOptions({
    queryKey: projectsQueryKeys.difficulties(),
    queryFn: listProjectDifficulties,
    staleTime: 5 * 60 * 1000,
  });

export function useProjectDifficultiesQuery() {
  return useQuery(projectDifficultiesQueryOptions());
}
