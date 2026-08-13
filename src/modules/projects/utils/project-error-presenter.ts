import type { TFunction } from "i18next";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

/**
 * Localized copy for the SK-112 error matrix
 * (`server/specs/003-github-project-publication/contracts/http-api.md`
 * §Error Matrix). Never branches on raw `message` text.
 */
const PROJECT_ERROR_MESSAGES: Record<string, string> = {
  GITHUB_REPOSITORY_REFERENCE_INVALID: "project.errors.repositoryReferenceInvalid",
  PROJECT_REQUEST_INVALID: "project.errors.requestInvalid",
  PROJECT_ACCOUNT_NOT_ELIGIBLE: "project.errors.accountNotEligible",
  GITHUB_SOURCE_NOT_AVAILABLE: "project.errors.sourceNotAvailable",
  PROJECT_NOT_FOUND: "project.errors.projectNotFound",
  PROJECT_REVISION_CONFLICT: "project.errors.revisionConflict",
  PROJECT_IDEMPOTENCY_KEY_REUSED: "project.errors.idempotencyKeyReused",
  PROJECT_SOURCE_CHANGED_SINCE_PREVIEW: "project.errors.sourceChangedSincePreview",
  PROJECT_REPOSITORY_ALREADY_PUBLISHED: "project.errors.repositoryAlreadyPublished",
  PROJECT_STATE_TRANSITION_INVALID: "project.errors.stateTransitionInvalid",
  PROJECT_IMPORT_ROUTE_RETIRED: "project.errors.importRouteRetired",
  PROJECT_PUBLICATION_INCOMPLETE: "project.errors.publicationIncomplete",
  PROJECT_REPOSITORY_CONTROL_REQUIRED: "project.errors.repositoryControlRequired",
  PROJECT_SOURCE_AUTHORIZATION_REQUIRED: "project.errors.sourceAuthorizationRequired",
  GITHUB_RATE_LIMITED: "project.errors.githubRateLimited",
  PROJECT_PUBLICATION_RECONCILIATION_REQUIRED:
    "project.errors.publicationReconciliationRequired",
  GITHUB_PROVIDER_UNAVAILABLE: "project.errors.githubProviderUnavailable",
  GITHUB_PROVIDER_INVALID_RESPONSE: "project.errors.githubProviderInvalidResponse",
  GITHUB_PROVIDER_TIMEOUT: "project.errors.githubProviderTimeout",
};

const FALLBACK_KEY = "project.errors.generic";

export function getProjectApiErrorMessage(t: TFunction, error: unknown): string {
  const code = getApiErrorCode(error);
  const key = code ? PROJECT_ERROR_MESSAGES[code] : undefined;
  if (key) return t(key);
  return getApiErrorMessage(error, t(FALLBACK_KEY));
}

export function isRepositoryControlRecoveryError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "PROJECT_REPOSITORY_CONTROL_REQUIRED" ||
    code === "PROJECT_SOURCE_AUTHORIZATION_REQUIRED"
  );
}

export function isRevisionConflictError(error: unknown): boolean {
  return getApiErrorCode(error) === "PROJECT_REVISION_CONFLICT";
}

export function isPreviewStaleError(error: unknown): boolean {
  return getApiErrorCode(error) === "PROJECT_SOURCE_CHANGED_SINCE_PREVIEW";
}
