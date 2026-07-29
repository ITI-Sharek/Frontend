import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelContributionRequest,
  createContributionRequestDraft,
  discardContributionRequestDraft,
  publishContributionRequest,
  updateContributionRequestDraft,
} from "../../services/contribution-requests.service";
import type {
  CancelContributionRequestPayload,
  ContributionRequestDraftPayload,
  DiscardContributionRequestPayload,
} from "../../types/contribution-request.types";
import { contributionRequestKeys } from "../query-keys";

export function useCreateContributionRequestMutation() {
  return useMutation({
    mutationFn: (input: {
      projectId: string;
      payload: ContributionRequestDraftPayload;
      idempotencyKey: string;
    }) =>
      createContributionRequestDraft(
        input.projectId,
        input.payload,
        input.idempotencyKey,
      ),
  });
}

export function useUpdateContributionRequestMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      payload: ContributionRequestDraftPayload;
      idempotencyKey: string;
    }) =>
      updateContributionRequestDraft(
        requestId,
        input.payload,
        input.idempotencyKey,
      ),
    onSuccess: (request) => {
      queryClient.setQueryData(contributionRequestKeys.detail(requestId), request);
      void queryClient.invalidateQueries({
        queryKey: contributionRequestKeys.ownerProjectList(request.projectId),
      });
    },
  });
}

export function useDiscardContributionRequestMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      payload: DiscardContributionRequestPayload;
      idempotencyKey: string;
    }) =>
      discardContributionRequestDraft(
        requestId,
        input.payload,
        input.idempotencyKey,
      ),
    onSuccess: (request) => {
      queryClient.setQueryData(contributionRequestKeys.detail(requestId), request);
      void queryClient.invalidateQueries({
        queryKey: contributionRequestKeys.ownerProjectList(request.projectId),
      });
    },
  });
}

export function usePublishContributionRequestMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { idempotencyKey: string }) =>
      publishContributionRequest(requestId, input.idempotencyKey),
    onSuccess: (request) => {
      queryClient.setQueryData(contributionRequestKeys.detail(requestId), request);
      void queryClient.invalidateQueries({
        queryKey: contributionRequestKeys.ownerProjectList(request.projectId),
      });
    },
  });
}

export function useCancelContributionRequestMutation(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      payload: CancelContributionRequestPayload;
      idempotencyKey: string;
    }) =>
      cancelContributionRequest(requestId, input.payload, input.idempotencyKey),
    onSuccess: (request) => {
      queryClient.setQueryData(contributionRequestKeys.detail(requestId), request);
      void queryClient.invalidateQueries({
        queryKey: contributionRequestKeys.ownerProjectList(request.projectId),
      });
    },
  });
}
