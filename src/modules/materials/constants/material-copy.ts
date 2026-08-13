import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

import {
  getApiErrorCode,
  getApiErrorMetadataNumber,
} from "@/shared/utils/get-api-error-code";

import { formatBytes } from "../utils/material-state";

/**
 * Stable `code` values are the contract; `message` is human copy and is never
 * branched on.
 */
const ERROR_COPY: Record<string, string> = {
  MATERIAL_FILE_REQUIRED: "material.errors.fileRequired",
  MATERIAL_TYPE_UNSUPPORTED: "material.errors.typeUnsupported",
  MATERIAL_CONTENT_MISMATCH: "material.errors.contentMismatch",
  MATERIAL_VISIBILITY_SCOPE_MISMATCH: "material.errors.visibilityScopeMismatch",
  MATERIAL_NOT_AUTHORIZED: "material.errors.notAuthorized",
  MATERIAL_NOT_FOUND: "material.errors.notFound",
  MATERIAL_VERSION_NOT_FOUND: "material.errors.versionNotFound",
  MATERIAL_VERSION_NOT_DOWNLOADABLE: "material.errors.versionNotDownloadable",
  MATERIAL_GRANT_NOT_APPLICABLE: "material.errors.grantNotApplicable",
  MATERIAL_GRANT_NOT_ASSIGNEE: "material.errors.grantNotAssignee",
  MATERIAL_GRANT_ALREADY_LIVE: "material.errors.grantAlreadyLive",
  MATERIAL_GRANT_SELF: "material.errors.grantSelf",
  MATERIAL_GRANT_NOT_FOUND: "material.errors.grantNotFound",
  MATERIAL_VISIBILITY_UNCHANGED: "material.errors.visibilityUnchanged",
  MATERIAL_VISIBILITY_CONFLICT: "material.errors.visibilityConflict",
  MATERIAL_ALREADY_DELETED: "material.errors.alreadyDeleted",
  MATERIAL_DOWNLOAD_TOKEN_EXPIRED: "material.errors.downloadTokenExpired",
  MATERIAL_DOWNLOAD_TOKEN_INVALID: "material.errors.downloadTokenInvalid",
  MATERIAL_DOWNLOAD_TOKEN_SUBJECT_MISMATCH:
    "material.errors.downloadTokenSubjectMismatch",
  MATERIAL_IDEMPOTENCY_KEY_REQUIRED: "material.errors.idempotencyKeyRequired",
  MATERIAL_IDEMPOTENCY_CONFLICT: "material.errors.idempotencyConflict",
};

export function getMaterialErrorMessage(t: TFunction, error: unknown): string {
  const code = getApiErrorCode(error);

  // The limit is quoted from the rejection itself rather than from the
  // constraints query: if the two ever disagree, the number that actually
  // refused this file is the honest one to show.
  if (code === "MATERIAL_TOO_LARGE") {
    const maxBytes = getApiErrorMetadataNumber(error, "maxBytes");
    return maxBytes === null
      ? t("material.errors.tooLarge")
      : t("material.errors.tooLargeWithLimit", {
          maxBytes: formatBytes(t, maxBytes),
        });
  }

  if (code && code in ERROR_COPY) return t(ERROR_COPY[code]);
  if (isAxiosError(error) && error.response === undefined) {
    return t("material.errors.network");
  }
  return t("material.errors.unknown");
}
