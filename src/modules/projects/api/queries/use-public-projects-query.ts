import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listPublishedProjects } from "../../services/public-projects.service";
import { projectsQueryKeys } from "../query-keys";
import type { PublicProjectsListParams } from "../../types/public-project.types";

export function usePublicProjectsQuery(params: PublicProjectsListParams = {}) {
  return useQuery({
    queryKey: projectsQueryKeys.public(params),
    queryFn: () => listPublishedProjects(params),
    placeholderData: keepPreviousData,
  });
}
