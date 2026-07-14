import { useMutation } from "@tanstack/react-query";

import { startSkillProfileGeneration } from "../../services/skill-profile-generation.service";

export function useStartSkillProfileGenerationMutation() {
  return useMutation({
    mutationFn: startSkillProfileGeneration,
  });
}
