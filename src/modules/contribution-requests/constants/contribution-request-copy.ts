import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import i18n from "@/lib/i18n";
import { activeLocale } from "@/lib/translate";

import type { ContributionRequestLocale } from "../types/contribution-request.types";

export function getContributionRequestErrorMessage(
  error: unknown,
  locale: ContributionRequestLocale = activeLocale(),
): string {
  const t = i18n.getFixedT(locale);
  const code = getApiErrorCode(error);
  if (code) {
    const key = `contributionRequests.errors.${code}`;
    const value = t(key);
    if (value !== key) return value;
  }

  if (isAxiosError(error) && error.response?.status === 401) return t("contributionRequests.errors.sessionExpired");

  return t("contributionRequests.errors.unknown");
}

export function isContributionRequestError(
  error: unknown,
  code: string,
): boolean {
  return getApiErrorCode(error) === code;
}
