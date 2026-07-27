import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
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

const INSTALLATION_STATUS_META: Record<
  GitHubAppInstallationStatus,
  InstallationStatusMeta
> = {
  active: {
    label: "مُفعّل",
    tone: "positive",
    description: "يمكن لـ Share-k قراءة المستودعات المحددة عبر هذا الربط.",
    usable: true,
    needsReauthorization: false,
  },
  disconnected: {
    label: "مفصول محلياً",
    tone: "neutral",
    description:
      "أوقفت قراءة Share-k عبر هذا الربط. تطبيق GitHub قد يكون ما زال مثبتاً على حسابك.",
    usable: false,
    needsReauthorization: true,
  },
  reauthorization_required: {
    label: "يحتاج إعادة تفويض",
    tone: "attention",
    description:
      "انتهت صلاحية تفويضك لهذا التثبيت. أعد التفويض للمتابعة دون إعادة التثبيت.",
    usable: false,
    needsReauthorization: true,
  },
  revoked: {
    label: "ملغى من GitHub",
    tone: "negative",
    description:
      "أُلغي التفويض من جهة GitHub. أعد الربط لاستئناف تحليل المهارات.",
    usable: false,
    needsReauthorization: true,
  },
};

export function getInstallationStatusMeta(
  status: GitHubAppInstallationStatus,
): InstallationStatusMeta {
  return INSTALLATION_STATUS_META[status];
}

export function getAccountTypeLabel(accountType: "user" | "organization") {
  return accountType === "organization" ? "منظمة" : "حساب شخصي";
}

export function isInstallationUsable(
  installation: Pick<GitHubAppInstallationLinkDto, "status">,
): boolean {
  return INSTALLATION_STATUS_META[installation.status].usable;
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
