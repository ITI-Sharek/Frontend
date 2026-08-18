import { queryOptions, useQuery } from "@tanstack/react-query";

import { projectsQueryKeys } from "../query-keys";
import { listProjectCategories } from "../../services/project-categories.service";

export const projectCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: projectsQueryKeys.categories(),
    queryFn: listProjectCategories,
    staleTime: 5 * 60 * 1000,
  });

export function useProjectCategoriesQuery() {
  return useQuery(projectCategoriesQueryOptions());
}
