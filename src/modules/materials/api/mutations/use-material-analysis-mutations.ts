import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  adoptContributionRequestMaterialSuggestion,
  adoptProjectMaterialSuggestion,
  createMaterialAnalysisSet,
  rejectMaterialDraftSuggestion,
  startMaterialAnalysisRun,
} from "../../services/materials.service";
import { materialKeys } from "../query-keys";

// Keep adoption reconciliation scoped to the caches affected by the response.
// Invalidating the module roots here refetches the active owner page and can
// make a successful confirmation look like a page restart.
const PROJECT_LISTS_KEY = ["projects", "mine", "list"] as const;

function contributionRequestOwnerListKey(projectId: string) {
  return ["contribution-requests", "owner-project-list", projectId] as const;
}

export function useCreateMaterialAnalysisSetMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (materialVersions: Array<{ materialId: string; version: number }>) =>
      createMaterialAnalysisSet(projectId, materialVersions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialKeys.analysisSets(projectId) });
    },
  });
}

export function useStartMaterialAnalysisRunMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (analysisSetId: string) => startMaterialAnalysisRun(analysisSetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialKeys.analysisSets(projectId) });
    },
  });
}

export function useRejectMaterialDraftSuggestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestionId: string) => rejectMaterialDraftSuggestion(suggestionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: materialKeys.analysisRuns() });
    },
  });
}

export function useAdoptProjectMaterialSuggestionMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { suggestionId: string; expectedRevision: number; idempotencyKey: string }) =>
      adoptProjectMaterialSuggestion(input.suggestionId, input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: materialKeys.analysisRuns() });
      if (result?.project) {
        queryClient.setQueryData(
          ["projects", "mine", "detail", projectId],
          result.project,
        );
      }
      void queryClient.invalidateQueries({ queryKey: PROJECT_LISTS_KEY });
    },
  });
}

export function useAdoptContributionRequestMaterialSuggestionMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      suggestionId: string;
      applicationsCloseTime: string;
      targetCompletionDate?: string | null;
      rewardCents?: number | null;
      rewardCurrency?: string | null;
      idempotencyKey: string;
    }) => adoptContributionRequestMaterialSuggestion(input.suggestionId, input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: materialKeys.analysisRuns() });
      if (result?.contributionRequest) {
        queryClient.setQueryData(
          ["contribution-requests", "detail", result.contributionRequest.id],
          result.contributionRequest,
        );
        queryClient.setQueryData(
          ["contribution-requests", "details", result.contributionRequest.id],
          result.contributionRequest,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: contributionRequestOwnerListKey(projectId),
      });
    },
  });
}
