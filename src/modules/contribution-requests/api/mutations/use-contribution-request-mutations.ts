import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createContributionRequestDraft,
  discardContributionRequestDraft,
  updateContributionRequestDraft,
} from "../../services/contribution-requests.service";
import type {
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
    },
  });
}
