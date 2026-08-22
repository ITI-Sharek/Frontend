import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

/**
 * Stable `code` values are the contract; `message` is human copy and is never
 * branched on. Mirrors `modules/materials/constants/material-copy.ts`'s
 * `ERROR_COPY` table.
 */
const ERROR_COPY: Record<string, string> = {
  CHAT_ATTACHMENTS_DISABLED: "assignmentConversations.attachments.errors.disabled",
  CHAT_ATTACHMENT_LIMIT_EXCEEDED:
    "assignmentConversations.attachments.errors.limitExceeded",
  CHAT_ATTACHMENT_TOO_LARGE: "assignmentConversations.attachments.errors.tooLarge",
  CHAT_ATTACHMENT_TYPE_UNSUPPORTED:
    "assignmentConversations.attachments.errors.typeUnsupported",
  CHAT_ATTACHMENT_CONTENT_MISMATCH:
    "assignmentConversations.attachments.errors.contentMismatch",
  CHAT_ATTACHMENT_FILE_REQUIRED:
    "assignmentConversations.attachments.errors.fileRequired",
  CHAT_ATTACHMENT_UPLOAD_RATE_LIMITED:
    "assignmentConversations.attachments.errors.rateLimited",
  CHAT_ATTACHMENT_SCAN_PENDING:
    "assignmentConversations.attachments.errors.scanPending",
  CHAT_ATTACHMENT_BLOCKED: "assignmentConversations.attachments.errors.blocked",
  CHAT_ATTACHMENT_SCAN_UNAVAILABLE:
    "assignmentConversations.attachments.errors.scanUnavailable",
  CHAT_ATTACHMENT_UPLOAD_NOT_FOUND:
    "assignmentConversations.attachments.errors.uploadNotFound",
};

/**
 * Never claims infection: `CHAT_ATTACHMENT_SCAN_UNAVAILABLE` means the scan
 * was retried to the limit and never produced a verdict, not that malware was
 * found — the copy for it says so.
 */
export function getChatAttachmentErrorMessage(t: TFunction, error: unknown): string {
  const code = getApiErrorCode(error);
  if (code && code in ERROR_COPY) return t(ERROR_COPY[code]);
  if (isAxiosError(error) && error.response === undefined) {
    return t("assignmentConversations.attachments.errors.network");
  }
  return t("assignmentConversations.attachments.errors.unknown");
}
