import { queryOptions, useQuery } from "@tanstack/react-query";

import { getSkillProfileGeneration } from "../../services/skill-profile-generation.service";
import { skillProfileKeys } from "../query-keys";
import type { SkillProfileGenerationDto } from "../../types/skill-profile-generation.types";

function isGenerationDone(data: SkillProfileGenerationDto | undefined): boolean {
  return (
    data?.status === "pending_review" ||
    data?.status === "needs_more_evidence" ||
    data?.status === "failed"
  );
}

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
    enabled,
    refetchInterval: (query) =>
      isGenerationDone(query.state.data) ? false : 3000,
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
