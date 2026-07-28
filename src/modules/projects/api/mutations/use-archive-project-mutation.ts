import { useMutation, useQueryClient } from "@tanstack/react-query";

import { archiveProject } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useArchiveProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveProject,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.ownerDetail(result.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.mineRoot,
      });
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.publicRoot,
      });
    },
  });
}
