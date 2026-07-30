/**
 * Canonical Application and Owner Decision contracts
 * (`docs/architecture/domain-model/APPLICATION.md`,
 * `docs/architecture/contracts/api-contract-additions.md` §5). Every
 * otherwise-valid submission enters `PENDING_OWNER_REVIEW` immediately; no
 * AI gate, quota, or automatic validation state exists on this contract.
 */

import type { AssignmentDto } from "./assignment.types";

export type ApplicationStatus =
  | "PENDING_OWNER_REVIEW"
  | "ACCEPTED"
  | "DECLINED_BY_OWNER"
  | "NOT_SELECTED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "REQUEST_CANCELLED";

export interface ApplicationContributorDto {
  id: string;
  username: string | null;
  displayName: string;
}

export interface ApplicationProfileContextDto {
  bio: string | null;
  availability: string | null;
  experienceLevel: {
    key: string;
    labelEn: string;
    labelAr: string;
  } | null;
  fields: Array<{
    key: string;
    labelEn: string;
    labelAr: string;
  }>;
  declaredSkills: string[];
}

export interface ApplicationRequirementSnapshotDto {
  required: Array<{ id: string; position: number; text: string }>;
  preferred: Array<{ id: string; position: number; text: string }>;
}

export interface ApplicationEvidenceSummaryDto {
  skillProfileId: string;
  name: string;
  proficiencyLevel: string;
  evidenceSummary: string | null;
  limitations: string[];
}

export interface OwnerDecisionDto {
  id: string;
  applicationId: string;
  contributionRequestId: string;
  decisionType: "ACCEPTED" | "DECLINED";
  feedback: string | null;
  decidedAt: string;
}

export interface ApplicationDto {
  id: string;
  contributionRequestId: string;
  contributor: ApplicationContributorDto;
  profileContext: ApplicationProfileContextDto;
  contributionApproach: string | null;
  proposedDeliveryDurationDays: number | null;
  status: ApplicationStatus;
  requirementSnapshot: ApplicationRequirementSnapshotDto;
  evidenceSummary: ApplicationEvidenceSummaryDto[];
  submittedAt: string;
  reviewDueAt: string | null;
  expiresAt: string | null;
  expiredAt: string | null;
  overdue: boolean;
  ownerDecision: OwnerDecisionDto | null;
  assignment: AssignmentDto | null;
}

export interface SubmitApplicationParams {
  contributionApproach: string;
  proposedDeliveryDurationDays: number;
  idempotencyKey: string;
}

export interface WithdrawApplicationParams {
  applicationId: string;
  idempotencyKey: string;
}

/** Stable backend error codes (§5) — never branch on `message` text. */
export type ApplicationApiErrorCode =
  | "ALREADY_APPLIED"
  | "APPLICATIONS_CLOSED"
  | "REQUEST_CANCELLED"
  | "REQUEST_TERMINAL"
  | "APPLICATION_NOT_AUTHORIZED"
  | "APPLICATION_IDEMPOTENCY_CONFLICT";

/** The owner's explicit accept/decline action — never an AI verdict. */
export type OwnerDecisionAction = "accept" | "decline";

export interface DeclineApplicationParams {
  applicationId: string;
  reason?: string;
}
