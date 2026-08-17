import { useQuery } from "@tanstack/react-query";

import { getPublishedProjectSavedState } from "../../services/public-projects.service";
import { projectsQueryKeys } from "../query-keys";

export function usePublicProjectSavedStateQuery(
  projectSlug: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: projectsQueryKeys.publicSavedState(projectSlug),
    queryFn: () => getPublishedProjectSavedState(projectSlug),
    enabled: enabled && projectSlug !== "",
    retry: false,
  });
}
