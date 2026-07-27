import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  retrySkillProfileGeneration,
  startSkillProfileGeneration,
} from "../../services/skill-profile-generation.service";
import { skillProfileKeys } from "../query-keys";

function useGenerationInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: skillProfileKeys.latestGeneration(),
    });
  };
}

export function useStartSkillProfileGenerationMutation() {
  const invalidate = useGenerationInvalidation();
  return useMutation({
    mutationFn: startSkillProfileGeneration,
    onSuccess: invalidate,
  });
}

export function useRetrySkillProfileGenerationMutation() {
  const invalidate = useGenerationInvalidation();
  return useMutation({
    mutationFn: retrySkillProfileGeneration,
    onSuccess: invalidate,
  });
}
