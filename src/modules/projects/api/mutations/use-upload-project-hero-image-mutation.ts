import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadProjectHeroImage } from "../../services/project-drafts.service";
import { projectsQueryKeys } from "../query-keys";

export function useUploadProjectHeroImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProjectHeroImage,
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
