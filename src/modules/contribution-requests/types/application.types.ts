/**
 * Canonical Application and Owner Decision contracts
 * (`docs/architecture/domain-model/APPLICATION.md`,
 * `docs/architecture/contracts/api-contract-additions.md` §5). Every
 * otherwise-valid submission enters `PENDING_OWNER_REVIEW` immediately; no
 * AI gate, quota, or automatic validation state exists on this contract.
 */

export type ApplicationStatus =
  | "PENDING_OWNER_REVIEW"
  | "ACCEPTED"
  | "DECLINED_BY_OWNER"
  | "NOT_SELECTED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "REQUEST_CANCELLED";

export interface ApplicationDto {
  id: string;
  contributionRequestId: string;
  contributorId: string;
  contributionApproach: string | null;
  proposedDeliveryDurationDays: number;
  /** Fixed Requirement Snapshot at submission (business rule 6, "Fixed Basis"). */
  requirementSnapshotId: string;
  /** Fixed authorized Evidence Snapshot at submission (business rule 6). */
  evidenceSnapshotId: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewDueAt: string | null;
  expiresAt: string | null;
  expiredAt: string | null;
}

export interface SubmitApplicationParams {
  contributionApproach?: string;
  proposedDeliveryDurationDays: number;
  idempotencyKey: string;
}

/** Stable backend error codes (§5) — never branch on `message` text. */
export type ApplicationApiErrorCode =
  | "ALREADY_APPLIED"
  | "APPLICATIONS_CLOSED"
  | "REQUEST_TERMINAL"
  | "APPLICATION_NOT_AUTHORIZED";

/** The owner's explicit accept/decline action — never an AI verdict. */
export type OwnerDecisionAction = "accept" | "decline";

export interface DeclineApplicationParams {
  applicationId: string;
  reason?: string;
}
