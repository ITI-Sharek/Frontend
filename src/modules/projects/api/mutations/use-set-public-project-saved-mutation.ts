import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  savePublishedProject,
  unsavePublishedProject,
} from "../../services/public-projects.service";
import { projectsQueryKeys } from "../query-keys";

export function useSetPublicProjectSavedMutation(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saved: boolean) =>
      saved
        ? savePublishedProject(projectSlug)
        : unsavePublishedProject(projectSlug),
    onSuccess: (state) => {
      queryClient.setQueryData(
        projectsQueryKeys.publicSavedState(projectSlug),
        state,
      );
    },
  });
}
