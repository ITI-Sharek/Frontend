import {
  getApiErrorCode,
  getApiErrorMetadataString,
} from "@/shared/utils/get-api-error-code";
import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type {
  SkillProfileGenerationDto,
  SkillProfileGenerationStatus,
} from "../types/skill-profile-generation.types";

interface GenerationStatusMeta {
  label: string;
  tone: StatusChipTone;
  /** User-facing meaning. `pending_review` is never described as approved. */
  description: string;
  terminal: boolean;
  retryable: boolean;
}

const GENERATION_STATUS_META: Record<
  SkillProfileGenerationStatus,
  GenerationStatusMeta
> = {
  queued: {
    label: "في الانتظار",
    tone: "waiting",
    description: "تم استلام طلبك وهو في قائمة الانتظار.",
    terminal: false,
    retryable: false,
  },
  collecting_evidence: {
    label: "جمع الأدلة",
    tone: "waiting",
    description: "نقرأ المستودعات المختارة لجمع أدلة مساهماتك.",
    terminal: false,
    retryable: false,
  },
  analyzing: {
    label: "قيد التحليل",
    tone: "ai",
    description: "يجري تحليل الأدلة لاستخراج مهارات مرشحة.",
    terminal: false,
    retryable: false,
  },
  pending_review: {
    label: "بانتظار مراجعة الإدارة",
    tone: "attention",
    description:
      "اكتمل التحليل بنجاح. المهارات المستخرجة ما زالت بانتظار اعتماد الإدارة، ولا تظهر للعامة قبل الاعتماد.",
    terminal: true,
    retryable: false,
  },
  needs_more_evidence: {
    label: "أدلة غير كافية",
    tone: "attention",
    description:
      "لم نجد مساهمات برمجية كافية منسوبة إليك. أعد المحاولة باختيار مستودعات تُظهر مساهماتك بوضوح أكبر.",
    terminal: true,
    retryable: true,
  },
  failed: {
    label: "فشل التحليل",
    tone: "negative",
    description: "تعذّر إكمال التحليل.",
    terminal: true,
    retryable: true,
  },
};

export function getGenerationStatusMeta(
  status: SkillProfileGenerationStatus,
): GenerationStatusMeta {
  return GENERATION_STATUS_META[status];
}

export function isGenerationTerminal(
  status: SkillProfileGenerationStatus,
): boolean {
  return GENERATION_STATUS_META[status].terminal;
}

export function isGenerationActive(
  status: SkillProfileGenerationStatus,
): boolean {
  return !GENERATION_STATUS_META[status].terminal;
}

/** Retry is offered only for `failed` and `needs_more_evidence`. */
export function canRetryGeneration(
  generation: Pick<SkillProfileGenerationDto, "status"> | null | undefined,
): boolean {
  if (!generation) return false;
  return GENERATION_STATUS_META[generation.status].retryable;
}

export function getGenerationProgressPercent(
  generation: Pick<SkillProfileGenerationDto, "status" | "progress">,
): number {
  if (isGenerationTerminal(generation.status)) return 100;
  const { selectedRepositoryCount, snapshottedRepositoryCount } =
    generation.progress;
  if (selectedRepositoryCount <= 0) return 0;
  const ratio = snapshottedRepositoryCount / selectedRepositoryCount;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

const SKILL_PROFILE_ERROR_MESSAGES: Record<string, string> = {
  SKILL_PROFILE_ANALYSIS_CONSENT_REQUIRED:
    "يلزم إقرار الموافقة الصريحة قبل بدء التحليل.",
  SKILL_PROFILE_GENERATION_ALREADY_ACTIVE:
    "لديك تحليل جارٍ بالفعل. تابعنا حالته أدناه.",
  SKILL_PROFILE_QUEUE_UNAVAILABLE:
    "خدمة التحليل غير متاحة حالياً. أعد المحاولة بعد قليل.",
  SKILL_PROFILE_GENERATION_NOT_RETRYABLE:
    "لا يمكن إعادة محاولة هذا التحليل في حالته الحالية.",
  SKILL_PROFILE_GENERATION_NOT_FOUND: "لم يُعثر على هذا التحليل.",
  SKILL_PROFILE_GENERATION_FORBIDDEN:
    "لا تملك صلاحية إجراء تحليل المهارات بهذا الحساب.",
  SKILL_PROFILE_REPOSITORY_SELECTION_LIMIT_EXCEEDED:
    "الحد الأقصى هو 10 مستودعات في التحليل الواحد.",
  SKILL_PROFILE_REPOSITORY_SELECTION_DUPLICATE:
    "تم اختيار المستودع نفسه أكثر من مرة.",
  SKILL_PROFILE_REPOSITORY_ID_INVALID:
    "أحد المستودعات المختارة لم يعد صالحاً. حدّث الاختيار وأعد المحاولة.",
  SKILL_PROFILE_INSTALLATION_REQUIRED:
    "تحتاج إلى ربط تطبيق GitHub نشط قبل بدء التحليل.",
};

const SKILL_PROFILE_FALLBACK_ERROR =
  "تعذّر إكمال العملية. أعد المحاولة بعد قليل.";

export function getSkillProfileErrorMessage(
  code: string | null | undefined,
): string {
  if (!code) return SKILL_PROFILE_FALLBACK_ERROR;
  return SKILL_PROFILE_ERROR_MESSAGES[code] ?? SKILL_PROFILE_FALLBACK_ERROR;
}

export function getSkillProfileApiErrorMessage(error: unknown): string {
  return getSkillProfileErrorMessage(getApiErrorCode(error));
}

/**
 * `SKILL_PROFILE_GENERATION_ALREADY_ACTIVE` carries the owned active
 * generation ID so start/retry can resume polling instead of erroring out.
 */
export function getActiveGenerationIdFromError(
  error: unknown,
): string | null {
  if (getApiErrorCode(error) !== "SKILL_PROFILE_GENERATION_ALREADY_ACTIVE") {
    return null;
  }
  return getApiErrorMetadataString(error, "generationId");
}
