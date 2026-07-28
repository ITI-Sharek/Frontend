/**
 * Canonical Assignment contract. Created only when an owner accepts an
 * Application (`docs/architecture/domain-model/CONTRIBUTION_REQUEST.md`
 * business rule 7); sibling pending Applications move to `NOT_SELECTED`.
 */

import type { ApplicationDto } from "./application.types";

export interface AssignmentDto {
  id: string;
  contributionRequestId: string;
  applicationId: string;
  contributorId: string;
  assignedAt: string;
  agreedDeliveryDueDate: string | null;
}

export interface AcceptApplicationResultDto {
  application: ApplicationDto;
  assignment: AssignmentDto;
}
