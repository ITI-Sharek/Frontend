import type { TFunction } from "i18next";

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

const GENERATION_STATUS_FLAGS: Record<
  SkillProfileGenerationStatus,
  Pick<GenerationStatusMeta, "tone" | "terminal" | "retryable">
> = {
  queued: { tone: "waiting", terminal: false, retryable: false },
  collecting_evidence: { tone: "waiting", terminal: false, retryable: false },
  analyzing: { tone: "ai", terminal: false, retryable: false },
  pending_review: { tone: "attention", terminal: true, retryable: false },
  needs_more_evidence: { tone: "attention", terminal: true, retryable: true },
  failed: { tone: "negative", terminal: true, retryable: true },
};

export function getGenerationStatusMeta(
  t: TFunction,
  status: SkillProfileGenerationStatus,
): GenerationStatusMeta {
  return {
    label: t(`skillProfile.generationStatus.${status}.label`),
    description: t(`skillProfile.generationStatus.${status}.description`),
    ...GENERATION_STATUS_FLAGS[status],
  };
}

export function isGenerationTerminal(
  status: SkillProfileGenerationStatus,
): boolean {
  return GENERATION_STATUS_FLAGS[status].terminal;
}

export function isGenerationActive(
  status: SkillProfileGenerationStatus,
): boolean {
  return !GENERATION_STATUS_FLAGS[status].terminal;
}

/** Retry is offered only for `failed` and `needs_more_evidence`. */
export function canRetryGeneration(
  generation: Pick<SkillProfileGenerationDto, "status"> | null | undefined,
): boolean {
  if (!generation) return false;
  return GENERATION_STATUS_FLAGS[generation.status].retryable;
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

const SKILL_PROFILE_ERROR_KEYS: Record<string, string> = {
  SKILL_PROFILE_ANALYSIS_CONSENT_REQUIRED:
    "skillProfile.errors.consentRequired",
  SKILL_PROFILE_GENERATION_ALREADY_ACTIVE:
    "skillProfile.errors.alreadyActive",
  SKILL_PROFILE_QUEUE_UNAVAILABLE: "skillProfile.errors.queueUnavailable",
  SKILL_PROFILE_GENERATION_NOT_RETRYABLE:
    "skillProfile.errors.notRetryable",
  SKILL_PROFILE_GENERATION_NOT_FOUND: "skillProfile.errors.notFound",
  SKILL_PROFILE_GENERATION_FORBIDDEN: "skillProfile.errors.forbidden",
  SKILL_PROFILE_REPOSITORY_SELECTION_LIMIT_EXCEEDED:
    "skillProfile.errors.repositoryLimitExceeded",
  SKILL_PROFILE_REPOSITORY_SELECTION_DUPLICATE:
    "skillProfile.errors.repositoryDuplicate",
  SKILL_PROFILE_REPOSITORY_ID_INVALID:
    "skillProfile.errors.repositoryInvalid",
  SKILL_PROFILE_INSTALLATION_REQUIRED:
    "skillProfile.errors.installationRequired",
};

export function getSkillProfileErrorMessage(
  t: TFunction,
  code: string | null | undefined,
): string {
  if (!code) return t("skillProfile.errors.generic");
  return t(SKILL_PROFILE_ERROR_KEYS[code] ?? "skillProfile.errors.generic");
}

export function getSkillProfileApiErrorMessage(
  t: TFunction,
  error: unknown,
): string {
  return getSkillProfileErrorMessage(t, getApiErrorCode(error));
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
