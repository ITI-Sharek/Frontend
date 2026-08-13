import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import type { TFunction } from "i18next";
import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type {
  GitHubAppInstallationLinkDto,
  GitHubAppInstallationStatus,
} from "../types/github-app.types";

interface InstallationStatusMeta {
  label: string;
  tone: StatusChipTone;
  description: string;
  /** Whether this link can be used to browse repositories / start analysis. */
  usable: boolean;
  /** Whether the contributor should re-authorize this existing installation. */
  needsReauthorization: boolean;
}

function getInstallationStatusMap(t: TFunction): Record<GitHubAppInstallationStatus, InstallationStatusMeta> {
 return {
  active: {
    label: t("githubApp.status.active.label"),
    tone: "positive",
    description: t("githubApp.status.active.description"),
    usable: true,
    needsReauthorization: false,
  },
  disconnected: {
    label: t("githubApp.status.disconnected.label"),
    tone: "neutral",
    description: t("githubApp.status.disconnected.description"),
    usable: false,
    needsReauthorization: true,
  },
  reauthorization_required: {
    label: t("githubApp.status.reauthorizationRequired.label"),
    tone: "attention",
    description: t("githubApp.status.reauthorizationRequired.description"),
    usable: false,
    needsReauthorization: true,
  },
  revoked: {
    label: t("githubApp.status.revoked.label"),
    tone: "negative",
    description: t("githubApp.status.revoked.description"),
    usable: false,
    needsReauthorization: true,
  },
  };
}

export function getInstallationStatusMeta(
  t: TFunction,
  status: GitHubAppInstallationStatus,
): InstallationStatusMeta {
  return getInstallationStatusMap(t)[status];
}

export function getAccountTypeLabel(t: TFunction, accountType: "user" | "organization") {
  return t(`githubApp.accountType.${accountType}`);
}

export function isInstallationUsable(
  installation: Pick<GitHubAppInstallationLinkDto, "status">,
): boolean {
  return installation.status === "active";
}

export function getUsableInstallations<
  T extends Pick<GitHubAppInstallationLinkDto, "status">,
>(installations: T[]): T[] {
  return installations.filter(isInstallationUsable);
}

/**
 * Picks the installation the picker should default to: the previously selected
 * one when it is still usable, otherwise the first usable link.
 */
export function resolveSelectedInstallationLinkId(
  installations: GitHubAppInstallationLinkDto[],
  currentSelection: string | null,
): string | null {
  const usable = getUsableInstallations(installations);
  if (
    currentSelection &&
    usable.some((item) => item.installationLinkId === currentSelection)
  ) {
    return currentSelection;
  }
  return usable[0]?.installationLinkId ?? null;
}

const GITHUB_APP_ERROR_MESSAGES: Record<string, string> = {
  GITHUB_APP_NOT_CONFIGURED:
    "ربط GitHub غير مُهيأ على الخادم حالياً. تواصل مع الدعم.",
  GITHUB_APP_STATE_INVALID:
    "انتهت صلاحية محاولة الربط أو أنها غير صالحة. ابدأ الربط من جديد.",
  GITHUB_APP_STATE_USER_MISMATCH:
    "محاولة الربط تخص جلسة أخرى. ابدأ الربط من جديد من حسابك.",
  GITHUB_APP_INSTALLATION_NOT_VERIFIED:
    "تعذّر التحقق من التثبيت على GitHub. أعد المحاولة.",
  GITHUB_APP_INSTALLATION_ACCESS_NOT_VERIFIED:
    "لم نتمكن من تأكيد صلاحيتك على هذا التثبيت. أعد التفويض من GitHub.",
  GITHUB_APP_INSTALLATION_INACTIVE:
    "هذا الربط غير مُفعّل. أعد التفويض أو اختر تثبيتاً آخر.",
  GITHUB_APP_REPOSITORY_NOT_SELECTED:
    "أحد المستودعات لم يعد ضمن المستودعات المسموح بها في تثبيت GitHub. حدّث الاختيار من GitHub ثم أعد المحاولة.",
  GITHUB_APP_REPOSITORY_ACCESS_REVOKED:
    "أُلغي وصول Share-k إلى أحد المستودعات المختارة. راجع إعدادات التثبيت على GitHub.",
  GITHUB_APP_PROVIDER_UNAVAILABLE:
    "خدمة GitHub غير متاحة حالياً. أعد المحاولة بعد قليل.",
  GITHUB_APP_PROVIDER_INVALID_RESPONSE:
    "وصل رد غير متوقع من GitHub. أعد المحاولة بعد قليل.",
  GITHUB_REPOSITORY_OAUTH_MIGRATED:
    "تم استبدال طريقة ربط المستودعات القديمة. استخدم ربط تطبيق GitHub من هذه الصفحة.",
};

const GITHUB_APP_FALLBACK_ERROR =
  "تعذّر إكمال العملية مع GitHub. أعد المحاولة.";

/** Maps a callback `?error=` code or an API failure to safe Arabic copy. */
export function getGitHubAppErrorMessage(code: string | null | undefined) {
  if (!code) return GITHUB_APP_FALLBACK_ERROR;
  return GITHUB_APP_ERROR_MESSAGES[code] ?? GITHUB_APP_FALLBACK_ERROR;
}

export function getGitHubAppApiErrorMessage(error: unknown): string {
  return getGitHubAppErrorMessage(getApiErrorCode(error));
}

/** Callback errors that mean "the attempt is dead, start over". */
export function isRestartableCallbackError(code: string | null): boolean {
  return (
    code === "GITHUB_APP_STATE_INVALID" ||
    code === "GITHUB_APP_STATE_USER_MISMATCH" ||
    code === "GITHUB_APP_INSTALLATION_NOT_VERIFIED" ||
    code === "GITHUB_APP_INSTALLATION_ACCESS_NOT_VERIFIED"
  );
}
