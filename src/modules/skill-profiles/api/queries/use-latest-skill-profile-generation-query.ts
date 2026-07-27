import { queryOptions, useQuery } from "@tanstack/react-query";

import { getLatestSkillProfileGeneration } from "../../services/skill-profile-generation.service";
import { skillProfileKeys } from "../query-keys";

/**
 * Reload recovery: fetched once when the skill-analysis area opens so an
 * in-flight generation can be restored and polled again.
 */
export function latestSkillProfileGenerationQueryOptions({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return queryOptions({
    queryKey: skillProfileKeys.latestGeneration(),
    queryFn: getLatestSkillProfileGeneration,
    enabled,
    staleTime: 0,
  });
}

export function useLatestSkillProfileGenerationQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery(latestSkillProfileGenerationQueryOptions({ enabled }));
}
