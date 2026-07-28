import { useMutation, useQueryClient } from "@tanstack/react-query";

import { publishProject } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function usePublishProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishProject,
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
