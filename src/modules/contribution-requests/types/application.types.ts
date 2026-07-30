/**
 * Canonical Sprint 4 Application and Owner Decision projections.
 *
 * Every otherwise-valid submission enters `PENDING_OWNER_REVIEW` immediately.
 * Assessment state is intentionally absent from the decision predicate.
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

export interface ApplicationExperienceLevelDto {
  key: string;
  labelEn: string;
  labelAr: string;
}

export interface ApplicationProfileFieldDto {
  key: string;
  labelEn: string;
  labelAr: string;
}

export interface ApplicationProfileContextDto {
  bio: string | null;
  availability: string | null;
  experienceLevel: ApplicationExperienceLevelDto | null;
  fields: ApplicationProfileFieldDto[];
  declaredSkills: string[];
}

export interface ApplicationRequirementDto {
  id: string;
  position: number;
  text: string;
}

export interface ApplicationRequirementSnapshotDto {
  required: ApplicationRequirementDto[];
  preferred: ApplicationRequirementDto[];
}

export interface ApplicationEvidenceSummaryDto {
  skillProfileId: string;
  name: string;
  proficiencyLevel: string;
  evidenceSummary: string | null;
  limitations: string[];
}

export type OwnerDecisionType = "ACCEPTED" | "DECLINED";

export interface OwnerDecisionDto {
  id: string;
  applicationId: string;
  contributionRequestId: string;
  decisionType: OwnerDecisionType;
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

export interface OwnerApplicationsDto {
  applications: ApplicationDto[];
}

export interface SubmitApplicationParams {
  contributionApproach: string;
  proposedDeliveryDurationDays: number;
  idempotencyKey: string;
}

export interface AcceptApplicationParams {
  applicationId: string;
  idempotencyKey: string;
}

export interface DeclineApplicationParams {
  applicationId: string;
  feedback: string;
  idempotencyKey: string;
}

export type DecisionFeedbackReportReason =
  | "fraud"
  | "misuse"
  | "reputation_manipulation"
  | "inaccurate_ai"
  | "harassment"
  | "other";

export type DecisionFeedbackReportStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "dismissed";

export interface DecisionFeedbackReportDto {
  id: string;
  ownerDecisionId: string;
  reason: DecisionFeedbackReportReason;
  description: string;
  status: DecisionFeedbackReportStatus;
  createdAt: string;
}

export interface ReportDecisionFeedbackParams {
  ownerDecisionId: string;
  reason: DecisionFeedbackReportReason;
  description: string;
}

export type ApplicationApiErrorCode =
  | "ALREADY_APPLIED"
  | "APPLICATIONS_CLOSED"
  | "REQUEST_CANCELLED"
  | "REQUEST_TERMINAL"
  | "APPLICATION_NOT_AUTHORIZED"
  | "APPLICATION_TERMINAL"
  | "APPLICATION_DECISION_FEEDBACK_REQUIRED"
  | "APPLICATION_IDEMPOTENCY_KEY_REQUIRED"
  | "APPLICATION_IDEMPOTENCY_CONFLICT"
  | "APPLICATION_CONCURRENT_MODIFICATION"
  | "OWNER_DECISION_REPORT_ALREADY_EXISTS";

/** The owner's explicit accept/decline action — never an AI verdict. */
export type OwnerDecisionAction = "accept" | "decline";
