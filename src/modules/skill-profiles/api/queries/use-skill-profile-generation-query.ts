import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSkillProfileGeneration } from "../../services/skill-profile-generation.service";
import { isGenerationTerminal } from "../../utils/skill-generation-presenter";
import { skillProfileKeys } from "../query-keys";
import type { SkillProfileGenerationDto } from "../../types/skill-profile-generation.types";

export const SKILL_PROFILE_POLL_INTERVAL_MS = 3000;

function isGenerationDone(data: SkillProfileGenerationDto | undefined): boolean {
  return data !== undefined && isGenerationTerminal(data.status);
}

/** Polls while the generation is active; stops on any terminal status. */
export function skillProfileGenerationQueryOptions({
  generationId,
  enabled = true,
}: {
  generationId: string;
  enabled?: boolean;
}) {
  return queryOptions({
    queryKey: skillProfileKeys.generation(generationId),
    queryFn: () => getSkillProfileGeneration(generationId),
    enabled: enabled && generationId !== "",
    refetchInterval: (query) =>
      isGenerationDone(query.state.data) ? false : SKILL_PROFILE_POLL_INTERVAL_MS,
  });
}

export function useSkillProfileGenerationQuery({
  generationId,
  enabled = true,
}: {
  generationId: string;
  enabled?: boolean;
}) {
  return useQuery(skillProfileGenerationQueryOptions({ generationId, enabled }));
}
