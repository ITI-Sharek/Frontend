import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminExperienceLevel,
  listAdminExperienceLevels,
  updateAdminExperienceLevel,
} from "../../services/admin-experience-levels.service";
import type { CreateExperienceLevelPayload } from "../../services/admin-experience-levels.service";
import { contributorProfileKeys } from "../query-keys";

export function useAdminExperienceLevelsQuery() {
  return useQuery({
    queryKey: contributorProfileKeys.adminExperienceLevels(),
    queryFn: listAdminExperienceLevels,
  });
}

export function useCreateExperienceLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExperienceLevelPayload) =>
      createAdminExperienceLevel(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.adminExperienceLevels(),
        }),
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.experienceLevels(),
        }),
      ]);
    },
  });
}

export function useUpdateExperienceLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      levelId,
      payload,
    }: {
      levelId: string;
      payload: { active?: boolean; sortOrder?: number };
    }) => updateAdminExperienceLevel(levelId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.adminExperienceLevels(),
        }),
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.experienceLevels(),
        }),
      ]);
    },
  });
}
