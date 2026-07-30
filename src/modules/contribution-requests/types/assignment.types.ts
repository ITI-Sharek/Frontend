/**
 * Canonical Assignment contract. Created only when an owner accepts an
 * Application (`docs/architecture/domain-model/CONTRIBUTION_REQUEST.md`
 * business rule 7); sibling pending Applications move to `NOT_SELECTED`.
 */

import type {
  ApplicationDto,
  OwnerDecisionDto,
} from "./application.types";

export interface AssignmentDto {
  id: string;
  contributionRequestId: string;
  applicationId: string;
  ownerDecisionId: string;
  contributorId: string;
  agreedDeliveryDurationDays: number;
  agreedDeliveryDueDate: string;
  assignedAt: string;
}

export interface OwnerDecisionResultDto {
  application: ApplicationDto;
  ownerDecision: OwnerDecisionDto;
  assignment: AssignmentDto | null;
}

/** Backward-compatible name for the acceptance result. */
export type AcceptApplicationResultDto = OwnerDecisionResultDto;
