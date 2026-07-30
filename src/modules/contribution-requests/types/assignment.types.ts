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
  assignedAt: string;
  agreedDeliveryDueDate: string;
}

export interface AcceptApplicationResultDto {
  application: ApplicationDto;
  ownerDecision: OwnerDecisionDto;
  assignment: AssignmentDto;
}
