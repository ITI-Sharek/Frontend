import { useMutation, useQueryClient } from "@tanstack/react-query";

import { editOwnerProject } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useEditProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editOwnerProject,
    onSuccess: (project) => {
      queryClient.setQueryData(
        projectsQueryKeys.ownerDetail(project.id),
        project,
      );
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.mineRoot,
      });
    },
  });
}
