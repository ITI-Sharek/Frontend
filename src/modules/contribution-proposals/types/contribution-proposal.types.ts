export type ContributionProposalStatus =
  | "PENDING"
  | "WITHDRAWN"
  | "ACCEPTED"
  | "DECLINED";

export type ResultingContributionRequestStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ASSIGNED"
  | "CANCELLED"
  | "DISCARDED";

export interface ContributionProposalVersionDto {
  version: number;
  title: string;
  problemOrOpportunity: string;
  proposedOutcome: string;
  projectBenefit: string;
  authoredBy: string;
  createdAt: string;
}

export interface ContributionProposalRevisionRequestDto {
  reason: string | null;
  requestedBy: string;
  requestedAt: string;
}

export interface ContributionProposalDto {
  id: string;
  projectId: string;
  proposerId: string;
  /** `firstName lastName`, trimmed. */
  proposerName: string;
  /** Null until the contributor has chosen a username. */
  proposerUsername: string | null;
  status: ContributionProposalStatus;
  currentVersion: number;
  disclosure: {
    version: string;
    acknowledgedAt: string;
  };
  revisionRequestedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  resultingContributionRequestId: string | null;
  resultingContributionRequestStatus: ResultingContributionRequestStatus | null;
  latestVersion: ContributionProposalVersionDto | null;
  versions: ContributionProposalVersionDto[];
  revisionRequests: ContributionProposalRevisionRequestDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ContributionProposalSummaryDto {
  id: string;
  projectId: string;
  proposerId: string;
  /** `firstName lastName`, trimmed. */
  proposerName: string;
  /** Null until the contributor has chosen a username. */
  proposerUsername: string | null;
  status: ContributionProposalStatus;
  currentVersion: number;
  title: string;
  revisionRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionProposalListDto {
  proposals: ContributionProposalSummaryDto[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface ContributionProposalListParams {
  cursor?: string;
  limit?: number;
}

export interface ContributionProposalFields {
  title: string;
  problemOrOpportunity: string;
  proposedOutcome: string;
  projectBenefit: string;
}

export interface SubmitContributionProposalPayload
  extends ContributionProposalFields {
  projectId: string;
  acknowledgesAttributionAndAssignmentDisclosure: true;
  idempotencyKey: string;
}

export interface SubmitContributionProposalVersionPayload
  extends ContributionProposalFields {
  proposalId: string;
  idempotencyKey: string;
}

export interface ProposalCommandPayload {
  proposalId: string;
  idempotencyKey: string;
}

export interface ProposalReasonCommandPayload extends ProposalCommandPayload {
  reason: string;
}

export interface ContributionProposalMisuseReportDto {
  id: string;
  proposalId: string;
  reporterId: string;
  reportedVersion: number;
  reason: string;
  createdAt: string;
}

export interface ProposalIntakeDto {
  projectId: string;
  enabled: boolean;
}

export type ProposalApiErrorCode =
  | "PROPOSAL_PROJECT_NOT_PUBLISHED"
  | "PROPOSAL_OWNER_CANNOT_PROPOSE"
  | "PROPOSAL_INTAKE_DISABLED"
  | "PROPOSAL_RATE_LIMITED"
  | "PROPOSAL_CURSOR_INVALID"
  | "PROPOSAL_IDEMPOTENCY_CONFLICT"
  | "PROPOSAL_TERMINAL"
  | "PROPOSAL_NOT_AUTHORIZED"
  | "PROPOSAL_IDEMPOTENCY_KEY_INVALID"
  | "PROPOSAL_CONCURRENT_MODIFICATION"
  | "PROPOSAL_NOT_FOUND"
  | "PROPOSAL_NO_REVISION_REQUESTED";
