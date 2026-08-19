import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  contributionRequestSchema,
  ownerProjectContributionRequestsSchema,
} from "../schemas/contribution-request.schema";
import type {
  CancelContributionRequestPayload,
  ContributionRequestDetailDto,
  ContributionRequestDraftPayload,
  ContributionRequestDto,
  ContributionRequestFeedFiltersDto,
  ContributionRequestFeedResponseDto,
  ContributionRequestSkillRequirementDto,
  DiscardContributionRequestPayload,
  OwnerProjectContributionRequestsDto,
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

export async function replaceContributionRequestSkillRequirements(
  requestId: string,
  skillRequirements: Array<{
    skillName: string;
    requiredLevel: "beginner" | "intermediate" | "advanced";
    kind: "required" | "preferred";
  }>,
): Promise<ContributionRequestSkillRequirementDto[]> {
  const { data } = await axiosInstance.put(
    `/contribution-requests/${encodeURIComponent(requestId)}/skill-requirements`,
    { skillRequirements },
  );
  return data;
}

export async function getContributionRequestSkillRequirements(
  requestId: string,
): Promise<ContributionRequestSkillRequirementDto[]> {
  const { data } = await axiosInstance.get(
    `/contribution-requests/${encodeURIComponent(requestId)}/skill-requirements`,
  );
  return data;
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

export async function publishContributionRequest(
  requestId: string,
  idempotencyKey: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.post(
    `/contribution-requests/${encodeURIComponent(requestId)}/publish`,
    undefined,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return contributionRequestSchema.parse(data);
}

export async function cancelContributionRequest(
  requestId: string,
  payload: CancelContributionRequestPayload,
  idempotencyKey: string,
): Promise<ContributionRequestDto> {
  const { data } = await axiosInstance.post(
    `/contribution-requests/${encodeURIComponent(requestId)}/cancel`,
    payload,
    { headers: idempotencyHeaders(idempotencyKey) },
  );
  return contributionRequestSchema.parse(data);
}

export async function listOwnerContributionRequestsForProject(
  projectId: string,
): Promise<OwnerProjectContributionRequestsDto> {
  const { data } = await axiosInstance.get(
    `/projects/${encodeURIComponent(projectId)}/contribution-requests`,
  );
  return ownerProjectContributionRequestsSchema.parse(data);
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
