import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getExploreProjects } from "../../services/explore.service";
import { projectsQueryKeys } from "../query-keys";
import type { ExploreSearchParamsDto } from "../../types/explore.types";

export function useExploreProjectsQuery(params: ExploreSearchParamsDto) {
  return useQuery({
    queryKey: projectsQueryKeys.explore(params),
    queryFn: () => getExploreProjects(params),
    // WF-03: filters stay interactive during fetch — keep last results visible.
    placeholderData: keepPreviousData,
  });
}
