import { axiosInstance } from "@/lib/axios/axios-instance";

import { contributionRequestSchema } from "../schemas/contribution-request.schema";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestDto,
  DiscardContributionRequestPayload,
} from "../types/contribution-request.types";

function idempotencyHeaders(idempotencyKey: string) {
  return { "Idempotency-Key": idempotencyKey };
}

export async function createContributionRequestDraft(
  projectId: string,
  payload: ContributionRequestDraftPayload,
  idempotencyKey: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.post(
    `/projects/${encodeURIComponent(projectId)}/contribution-requests`,
    payload,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return contributionRequestSchema.parse(data);
}

export async function getContributionRequest(
  requestId: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.get(
    `/contribution-requests/${encodeURIComponent(requestId)}`,
  );
  return contributionRequestSchema.parse(data);
}

export async function updateContributionRequestDraft(
  requestId: string,
  payload: ContributionRequestDraftPayload,
  idempotencyKey: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.patch(
    `/contribution-requests/${encodeURIComponent(requestId)}`,
    payload,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return contributionRequestSchema.parse(data);
}

export async function discardContributionRequestDraft(
  requestId: string,
  payload: DiscardContributionRequestPayload,
  idempotencyKey: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.post(
    `/contribution-requests/${encodeURIComponent(requestId)}/discard`,
    payload,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return contributionRequestSchema.parse(data);
}
