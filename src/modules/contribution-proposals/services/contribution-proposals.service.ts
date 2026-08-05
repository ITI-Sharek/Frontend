import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  ContributionProposalDto,
  ContributionProposalListDto,
  ContributionProposalMisuseReportDto,
  ProposalCommandPayload,
  ProposalIntakeDto,
  ProposalReasonCommandPayload,
  SubmitContributionProposalPayload,
  SubmitContributionProposalVersionPayload,
} from "../types/contribution-proposal.types";

export async function submitContributionProposal(
  payload: SubmitContributionProposalPayload,
): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    "/contribution-proposals",
    payload,
  );
  return data;
}

export async function listMyContributionProposals(): Promise<ContributionProposalListDto> {
  const { data } = await axiosInstance.get<ContributionProposalListDto>(
    "/contribution-proposals/mine",
  );
  return data;
}

export async function listProjectContributionProposals(
  projectId: string,
): Promise<ContributionProposalListDto> {
  const { data } = await axiosInstance.get<ContributionProposalListDto>(
    `/contribution-proposals/for-project/${encodeURIComponent(projectId)}`,
  );
  return data;
}

export async function getContributionProposal(
  proposalId: string,
): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.get<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}`,
  );
  return data;
}

export async function submitContributionProposalVersion({
  proposalId,
  ...payload
}: SubmitContributionProposalVersionPayload): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}/versions`,
    payload,
  );
  return data;
}

export async function requestContributionProposalRevision({
  proposalId,
  ...payload
}: ProposalReasonCommandPayload): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}/revision-requests`,
    payload,
  );
  return data;
}

export async function acceptContributionProposal({
  proposalId,
  ...payload
}: ProposalCommandPayload): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}/accept`,
    payload,
  );
  return data;
}

export async function declineContributionProposal({
  proposalId,
  ...payload
}: ProposalReasonCommandPayload): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}/decline`,
    payload,
  );
  return data;
}

export async function reportContributionProposalMisuse({
  proposalId,
  ...payload
}: ProposalReasonCommandPayload): Promise<ContributionProposalMisuseReportDto> {
  const { data } =
    await axiosInstance.post<ContributionProposalMisuseReportDto>(
      `/contribution-proposals/${encodeURIComponent(proposalId)}/misuse-reports`,
      payload,
    );
  return data;
}

export async function withdrawContributionProposal({
  proposalId,
  idempotencyKey,
}: ProposalCommandPayload): Promise<ContributionProposalDto> {
  const { data } = await axiosInstance.post<ContributionProposalDto>(
    `/contribution-proposals/${encodeURIComponent(proposalId)}/withdraw`,
    undefined,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function setContributionProposalIntake(
  projectId: string,
  enabled: boolean,
): Promise<ProposalIntakeDto> {
  const { data } = await axiosInstance.put<ProposalIntakeDto>(
    `/contribution-proposals/for-project/${encodeURIComponent(projectId)}/intake`,
    { enabled },
  );
  return data;
}
