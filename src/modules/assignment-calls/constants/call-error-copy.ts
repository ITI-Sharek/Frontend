import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

/**
 * Stable `code` values are the contract; `message` is human copy and is
 * never branched on. Mirrors `modules/assignment-conversations/constants/
 * attachment-copy.ts`'s `ERROR_COPY` table.
 *
 * `ASSIGNMENT_CALL_QUIET_HOURS` and `ASSIGNMENT_CALL_PARTICIPANT_BUSY` map
 * to the SAME copy on purpose: the server README states the caller must see
 * the same "participant unavailable" shape a busy peer would produce, never
 * a hint that quiet hours specifically were the reason.
 */
const ERROR_COPY: Record<string, string> = {
  ASSIGNMENT_CALL_DISABLED: "assignmentCalls.errors.disabled",
  ASSIGNMENT_CALL_QUIET_HOURS: "assignmentCalls.errors.participantUnavailable",
  ASSIGNMENT_CALL_PARTICIPANT_BUSY: "assignmentCalls.errors.participantUnavailable",
  ASSIGNMENT_CALL_RING_EXPIRED: "assignmentCalls.errors.ringExpired",
  ASSIGNMENT_CALL_FREE_CAPACITY_EXHAUSTED: "assignmentCalls.errors.capacityExhausted",
  ASSIGNMENT_CALL_PROVIDER_UNAVAILABLE: "assignmentCalls.errors.providerUnavailable",
  ASSIGNMENT_CALL_NOT_FOUND: "assignmentCalls.errors.notFound",
  ASSIGNMENT_CALL_INVALID_STATE: "assignmentCalls.errors.invalidState",
  ASSIGNMENT_CALL_SIGNAL_REJECTED: "assignmentCalls.errors.signalRejected",
  ASSIGNMENT_CALL_SIGNAL_TOO_LARGE: "assignmentCalls.errors.signalRejected",
  ASSIGNMENT_CALL_SIGNAL_RATE_LIMITED: "assignmentCalls.errors.signalRateLimited",
  ASSIGNMENT_CALL_MAX_DURATION_REACHED: "assignmentCalls.errors.maxDurationReached",
  ASSIGNMENT_CONVERSATION_READ_ONLY: "assignmentCalls.errors.conversationReadOnly",
};

export function getAssignmentCallErrorMessage(t: TFunction, error: unknown): string {
  const code = getApiErrorCode(error);
  if (code && code in ERROR_COPY) return t(ERROR_COPY[code]);
  if (isAxiosError(error) && error.response === undefined) {
    return t("assignmentCalls.errors.network");
  }
  return t("assignmentCalls.errors.unknown");
}
