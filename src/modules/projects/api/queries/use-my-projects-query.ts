import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getMyProjects } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";
import type { MyProjectsListParams } from "../../types/my-projects.types";

export function useMyProjectsQuery(params: MyProjectsListParams = {}) {
  return useQuery({
    queryKey: projectsQueryKeys.mine(params),
    queryFn: () => getMyProjects(params),
    placeholderData: keepPreviousData,
  });
}
