import { useQuery } from "@tanstack/react-query";

import { getPublishedProjectApplicants } from "../../services/public-projects.service";
import { projectsQueryKeys } from "../query-keys";

export function usePublicProjectApplicantsQuery(projectSlug: string) {
  return useQuery({
    queryKey: projectsQueryKeys.publicApplicants(projectSlug),
    queryFn: () => getPublishedProjectApplicants(projectSlug),
    enabled: projectSlug !== "",
    retry: false,
  });
}
