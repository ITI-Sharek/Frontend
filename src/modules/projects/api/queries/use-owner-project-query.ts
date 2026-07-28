import { useQuery } from "@tanstack/react-query";

import { getOwnerProject } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useOwnerProjectQuery(projectId: string) {
  return useQuery({
    queryKey: projectsQueryKeys.ownerDetail(projectId),
    queryFn: () => getOwnerProject(projectId),
    enabled: projectId !== "",
  });
}
