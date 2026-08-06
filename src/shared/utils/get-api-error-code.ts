import { isAxiosError } from "axios";

/**
 * Backend error envelope (`HttpExceptionFilter`):
 * `{ statusCode, code, message, metadata? }`. Stable `code` values are the
 * contract; `message` is human copy and must never be branched on.
 */
export function getApiErrorCode(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const code = error.response?.data?.code;
  return typeof code === "string" ? code : null;
}

export function getApiErrorMetadata(
  error: unknown,
): Record<string, unknown> | null {
  if (!isAxiosError(error)) return null;
  const metadata = error.response?.data?.metadata;
  if (typeof metadata !== "object" || metadata === null) return null;
  return metadata as Record<string, unknown>;
}

export function getApiErrorMetadataString(
  error: unknown,
  key: string,
): string | null {
  const value = getApiErrorMetadata(error)?.[key];
  return typeof value === "string" && value !== "" ? value : null;
}

/**
 * Numeric sibling of `getApiErrorMetadataString`. Needed because the backend
 * sends numeric metadata as numbers, not strings — the string getter returns
 * null for those, so reaching for it silently drops the detail.
 */
export function getApiErrorMetadataNumber(
  error: unknown,
  key: string,
): number | null {
  const value = getApiErrorMetadata(error)?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
