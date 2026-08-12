import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

import {
  getApiErrorCode,
  getApiErrorMetadataNumber,
} from "@/shared/utils/get-api-error-code";

const ERROR_COPY_KEYS: Record<string, string> = {
  PROPOSAL_PROJECT_NOT_PUBLISHED: "proposalErrors.projectNotPublished",
  PROPOSAL_OWNER_CANNOT_PROPOSE: "proposalErrors.ownerCannotPropose",
  PROPOSAL_INTAKE_DISABLED: "proposalErrors.intakeDisabled",
  PROPOSAL_RATE_LIMITED: "proposalErrors.rateLimited",
  PROPOSAL_CURSOR_INVALID: "proposalErrors.cursorInvalid",
  PROPOSAL_IDEMPOTENCY_CONFLICT: "proposalErrors.idempotencyConflict",
  PROPOSAL_TERMINAL: "proposalErrors.terminal",
  PROPOSAL_NOT_AUTHORIZED: "proposalErrors.notAuthorized",
  PROPOSAL_IDEMPOTENCY_KEY_INVALID: "proposalErrors.idempotencyKeyInvalid",
  PROPOSAL_CONCURRENT_MODIFICATION: "proposalErrors.concurrentModification",
  PROPOSAL_NOT_FOUND: "proposalErrors.notFound",
  PROPOSAL_NO_REVISION_REQUESTED: "proposalErrors.noRevisionRequested",
};

export function getProposalErrorMessage(
  t: TFunction,
  error: unknown,
): string {
  const code = getApiErrorCode(error);
  // The backend sends the limit it enforced; telling the contributor the
  // number is more useful than telling them a limit exists. Falls through to
  // the static copy when the server does not supply it.
  if (code === "PROPOSAL_RATE_LIMITED") {
    const dailyLimit = getApiErrorMetadataNumber(error, "dailyLimit");
    if (dailyLimit !== null) {
      return t("proposalErrors.rateLimitedWithCount", { count: dailyLimit });
    }
  }
  const key = code ? ERROR_COPY_KEYS[code] : undefined;
  if (key) return t(key);
  if (isAxiosError(error) && error.response?.status === 401) {
    return t("proposalErrors.sessionExpired");
  }
  return t("proposalErrors.generic");
}

export function shouldRefreshProposalAfterError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "PROPOSAL_TERMINAL" ||
    code === "PROPOSAL_CONCURRENT_MODIFICATION" ||
    code === "PROPOSAL_IDEMPOTENCY_CONFLICT"
  );
}
