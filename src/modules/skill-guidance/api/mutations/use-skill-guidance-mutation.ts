import { useMutation } from "@tanstack/react-query";

import { requestSkillGapGuidance } from "../../services/skill-guidance.service";

export function useSkillGapGuidanceMutation() {
  return useMutation({
    mutationFn: requestSkillGapGuidance,
  });
}
