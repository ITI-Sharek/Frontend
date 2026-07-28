import { axiosInstance } from "@/lib/axios/axios-instance";

import { contributionRequestSchema } from "../schemas/contribution-request.schema";
import type {
  ContributionRequestDetailDto,
  ContributionRequestDraftPayload,
  ContributionRequestDto,
  ContributionRequestFeedFiltersDto,
  ContributionRequestFeedResponseDto,
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

/**
 * Contribution Request reads (`docs/architecture/contracts/api-contract-additions.md`
 * §5, §"Public (no auth)"). Route URLs keep the `/tasks` transport path;
 * visible copy and these contracts use canonical Contribution Request vocabulary.
 */

export async function listContributionRequests(
  filters: ContributionRequestFeedFiltersDto = {},
): Promise<ContributionRequestFeedResponseDto> {
  const { data } = await axiosInstance.get<ContributionRequestFeedResponseDto>(
    "/tasks",
    { params: filters },
  );
  return data;
}

export async function getContributionRequestById(
  contributionRequestId: string,
): Promise<ContributionRequestDetailDto> {
  const { data } = await axiosInstance.get<ContributionRequestDetailDto>(
    `/tasks/${encodeURIComponent(contributionRequestId)}`,
  );
  return data;
}
