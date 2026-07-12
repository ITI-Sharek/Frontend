import { useMutation } from "@tanstack/react-query";

import { requestSkillsGeneration } from "../../services/contributor-profile-completion.service";

export function useGenerateSkillsMutation() {
  return useMutation({
    mutationFn: requestSkillsGeneration,
  });
}
