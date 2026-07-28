import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProjectDraft } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useCreateProjectDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectDraft,
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
