import { useQuery } from "@tanstack/react-query";

import { getPublishedProjectBySlug } from "../../services/public-projects.service";
import { projectsQueryKeys } from "../query-keys";

export function usePublicProjectBySlugQuery(projectSlug: string) {
  return useQuery({
    queryKey: projectsQueryKeys.publicBySlug(projectSlug),
    queryFn: () => getPublishedProjectBySlug(projectSlug),
    enabled: projectSlug !== "",
    retry: false,
  });
}
