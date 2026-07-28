import { useMutation, useQueryClient } from "@tanstack/react-query";

import { refreshProjectSource } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useRefreshProjectSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshProjectSource,
    onSuccess: (project) => {
      queryClient.setQueryData(
        projectsQueryKeys.ownerDetail(project.id),
        project,
      );
    },
  });
}
