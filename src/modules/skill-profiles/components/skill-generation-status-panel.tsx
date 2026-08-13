import {
  CircleAlert,
  CircleSlash,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

import { StatusChip } from "@/shared/components/data-display/status-chip";
import { Button } from "@/shared/components/ui/button";

import {
  canRetryGeneration,
  getGenerationProgressPercent,
  getGenerationStatusMeta,
} from "../utils/skill-generation-presenter";
import type {
  SkillProfileGenerationDto,
  SkillProfileGenerationStatus,
} from "../types/skill-profile-generation.types";

const STATUS_ICON = {
  queued: Clock,
  collecting_evidence: Loader2,
  analyzing: Sparkles,
  pending_review: Clock,
  needs_more_evidence: CircleAlert,
  failed: CircleSlash,
} as const satisfies Record<SkillProfileGenerationStatus, typeof Clock>;

interface SkillGenerationStatusPanelProps {
  generation: SkillProfileGenerationDto;
  onRetry: () => void;
  isRetrying?: boolean;
  errorMessage?: string | null;
  /** Retry needs fresh consent, collected by the caller before enabling. */
  retryDisabled?: boolean;
  retryConsentSlot?: ReactNode;
}

/**
 * Owner-only generation status. `pending_review` is presented as "analysis
 * succeeded, awaiting admin review" — never as approved. Repository names come
 * from the server-derived snapshot and stay on this owner surface.
 */
export function SkillGenerationStatusPanel({
  generation,
  onRetry,
  isRetrying = false,
  errorMessage = null,
  retryDisabled = false,
  retryConsentSlot = null,
}: SkillGenerationStatusPanelProps) {
  const { t } = useTranslation();
  const meta = getGenerationStatusMeta(t, generation.status);
  const Icon = STATUS_ICON[generation.status];
  const percent = getGenerationProgressPercent(generation);
  const showRetry = canRetryGeneration(generation);

  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">
          {t("skillProfile.status.title")}
        </h3>
        <StatusChip tone={meta.tone} icon={Icon}>
          {meta.label}
        </StatusChip>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {meta.description}
      </p>

      {generation.status === "failed" && generation.failureReason && (
        <p
          role="alert"
          className="mt-3 rounded-input border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          {generation.failureReason}
        </p>
      )}

      <div className="mt-4">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-border/60"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("skillProfile.status.progressAriaLabel")}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("skillProfile.status.repositoriesProcessed", {
            snapshotted: generation.progress.snapshottedRepositoryCount,
            selected: generation.progress.selectedRepositoryCount,
          })}
        </p>
      </div>

      {generation.selectedRepositories.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {generation.selectedRepositories.map((repository) => (
            <li
              key={repository.repositoryId}
              dir="ltr"
              className="rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {repository.fullName}
            </li>
          ))}
        </ul>
      )}

      {generation.status === "pending_review" && generation.skills.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-foreground">
            {t("skillProfile.status.candidateSkills", {
              count: generation.skills.length,
            })}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {generation.skills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center justify-between gap-3 rounded-input border border-border bg-background px-3 py-2"
              >
                <span className="text-sm text-foreground">{skill.name}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`skillProfile.proficiency.${skill.proficiency}`)}
                  {" · "}
                  {skill.status === "approved"
                    ? t("skillProfile.status.approved")
                    : t("skillProfile.status.pendingReview")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRetry && (
        <div className="mt-5 flex flex-col gap-3">
          {retryConsentSlot}
          {errorMessage && (
            <p role="alert" className="text-xs text-destructive">
              {errorMessage}
            </p>
          )}
          <div>
            <Button
              type="button"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying || retryDisabled}
            >
              {isRetrying
                ? t("skillProfile.status.retrying")
                : t("skillProfile.status.retry")}
            </Button>
          </div>
        </div>
      )}

      {!showRetry && errorMessage && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
