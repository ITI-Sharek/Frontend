import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { translate } from "@/lib/translate";

import type {
  ApplicationApiErrorCode,
  ApplicationStatus,
} from "../types/application.types";

export function getApplicationErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (code) {
    const key = `application.errors.${code}`;
    const value = translate(key);
    if (value !== key) return value;
  }
  if (isAxiosError(error) && error.response?.status === 401) {
    return translate("application.errors.sessionExpired");
  }
  return translate("application.errors.unknown");
}

export function shouldRefreshApplicationAfterError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "APPLICATION_TERMINAL" ||
    code === "APPLICATION_CONCURRENT_MODIFICATION" ||
    code === "REQUEST_CANCELLED" ||
    code === "REQUEST_TERMINAL"
  );
}

export type ApplicationSubmissionRecovery =
  | "existing_application"
  | "available_requests"
  | "account"
  | "edit";

type ApplicationSubmissionErrorCode = Extract<
  ApplicationApiErrorCode,
  | "ALREADY_APPLIED"
  | "APPLICATIONS_CLOSED"
  | "REQUEST_CANCELLED"
  | "REQUEST_TERMINAL"
  | "APPLICATION_NOT_AUTHORIZED"
  | "APPLICATION_IDEMPOTENCY_CONFLICT"
>;

export function getApplicationSubmissionErrorMeta(): Record<
  ApplicationSubmissionErrorCode,
  { message: string; recovery: ApplicationSubmissionRecovery }
> {
  return {
  ALREADY_APPLIED: {
    message: translate("application.submissionErrors.ALREADY_APPLIED"),
    recovery: "existing_application",
  },
  APPLICATIONS_CLOSED: {
    message: translate("application.submissionErrors.APPLICATIONS_CLOSED"),
    recovery: "available_requests",
  },
  REQUEST_CANCELLED: {
    message: translate("application.submissionErrors.REQUEST_CANCELLED"),
    recovery: "available_requests",
  },
  REQUEST_TERMINAL: {
    message: translate("application.submissionErrors.REQUEST_TERMINAL"),
    recovery: "available_requests",
  },
  APPLICATION_NOT_AUTHORIZED: {
    message: translate("application.submissionErrors.APPLICATION_NOT_AUTHORIZED"),
    recovery: "account",
  },
  APPLICATION_IDEMPOTENCY_CONFLICT: {
    message: translate("application.submissionErrors.APPLICATION_IDEMPOTENCY_CONFLICT"),
    recovery: "edit",
  },
  };
}

export function getApplicationStatusCopy(): Record<
  ApplicationStatus,
  { label: string; description: string }
> {
  return {
  PENDING_OWNER_REVIEW: {
    label: translate("application.status.pending.label"),
    description: translate("application.status.pending.description"),
  },
  ACCEPTED: {
    label: translate("application.status.accepted.label"),
    description: translate("application.status.accepted.description"),
  },
  DECLINED_BY_OWNER: {
    label: translate("application.status.declined.label"),
    description: translate("application.status.declined.description"),
  },
  NOT_SELECTED: {
    label: translate("application.status.notSelected.label"),
    description: translate("application.status.notSelected.description"),
  },
  EXPIRED: {
    label: translate("application.status.expired.label"),
    description: translate("application.status.expired.description"),
  },
  WITHDRAWN: {
    label: translate("application.status.withdrawn.label"),
    description: translate("application.status.withdrawn.description"),
  },
  REQUEST_CANCELLED: {
    label: translate("application.status.cancelled.label"),
    description: translate("application.status.cancelled.description"),
  },
  };
}

export function getApplicationSubmissionErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (isApplicationApiErrorCode(code)) {
    return getApplicationSubmissionErrorMeta()[code].message;
  }
  if (isAxiosError(error) && error.response?.status === 401) {
    return translate("application.errors.sessionExpired");
  }
  return translate("application.submissionErrors.unknown");
}

export function isApplicationApiErrorCode(
  code: string | null,
): code is ApplicationSubmissionErrorCode {
  return (
    code !== null &&
    Object.hasOwn(getApplicationSubmissionErrorMeta(), code)
  );
}
