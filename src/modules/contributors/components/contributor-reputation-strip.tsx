import { Github, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { StatValue } from "@/shared/components/data-display/stat";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Stats side panel (screen-inventory §1.8 reputation data).
 *
 * Reputation is the profile's headline claim, so the rating is set as a
 * figure first and a row of stars second — the stars confirm the number
 * rather than standing in for it. Everything below is a fact table: label
 * small and quiet, value tabular and heavy, aligned on a single column so the
 * whole rail can be read down its end edge.
 *
 * All contribution metrics come from the backend's verified reputation
 * projection; the client does not derive reputation from profile history.
 */
export function ContributorReputationStrip({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
  const {
    rating,
    reviewsCount,
    completedContributions,
    totalAssignedTasks,
    successRate,
    topVerifiedSkills,
  } = profile.reputationSummary;

  const maxSkillCount = topVerifiedSkills.reduce(
    (max, skill) => Math.max(max, skill.verifiedContributionCount),
    0,
  );

  return (
    <div className="h-full overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)]">
      <h2 className="border-b border-border px-5 py-3.5 text-sm font-bold uppercase tracking-[0.06em] text-foreground">
        {t("contributor.reputation.title")}
      </h2>

      {/* ── Rating ── */}
      <div className="border-b border-border px-5 py-4">
        {rating === null ? (
          <p className="text-sm text-muted-foreground">
            {t("contributor.reputation.new")}
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-2.5" dir="ltr">
              <StatValue value={rating.toFixed(1)} size="lg" />
              <StarRating rating={rating} />
            </div>
            <p className="mt-1.5 text-xs text-subtle-foreground">
              {t("contributor.reputation.ratings")} ·{" "}
              <span className="tnum">{reviewsCount}</span>
            </p>
          </>
        )}
      </div>

      {/* ── Fact table ── */}
      <dl className="grid grid-cols-2 divide-x divide-border border-b border-border rtl:divide-x-reverse">
        <FactCell
          label={t("contributor.reputation.completedContributions")}
          value={completedContributions}
          tone="evidence"
        />
        <FactCell
          label={t("contributor.reputation.successRate")}
          value={formatPercentage(successRate)}
        />
        <FactCell
          label={t("contributor.reputation.assignedTasks")}
          value={totalAssignedTasks}
          className="border-t border-border"
        />
        <FactCell
          label={t("contributor.reputation.githubAccount")}
          className="border-t border-border"
          value={
            profile.githubStatus.connected ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-evidence-teal">
                <Github className="size-4" />
                {t("common.connected")}
              </span>
            ) : (
              <span className="text-sm font-medium text-subtle-foreground">
                {t("common.disconnected")}
              </span>
            )
          }
          raw
        />
      </dl>

      {/* ── Availability ── */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <dt className="text-xs font-medium text-muted-foreground">
          {t("contributor.reputation.availability")}
        </dt>
        <dd className="text-sm font-semibold text-foreground">
          {profile.availability ?? t("common.notSpecified")}
        </dd>
      </div>

      {/* ── Top verified skills ── */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {t("contributor.reputation.topVerifiedSkills")}
        </h3>
        {topVerifiedSkills.length > 0 ? (
          <ol className="mt-3.5 flex flex-col gap-3">
            {topVerifiedSkills.map((skill) => (
              <li key={skill.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    dir="ltr"
                    className="truncate font-mono text-xs font-medium text-foreground"
                  >
                    {skill.name}
                  </span>
                  <span className="tnum shrink-0 text-[11px] text-subtle-foreground">
                    {t("contributor.reputation.verifiedContributions", {
                      count: skill.verifiedContributionCount,
                    })}
                  </span>
                </div>
                {/*
                 * A bar relative to this contributor's own strongest skill:
                 * it ranks their evidence against itself, which is the only
                 * comparison the data actually supports.
                 */}
                <div className="sk-meter mt-1.5 h-1" data-tone="evidence">
                  <span
                    style={{
                      width: `${
                        maxSkillCount > 0
                          ? (skill.verifiedContributionCount / maxSkillCount) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {t("contributor.reputation.noVerifiedSkills")}
          </p>
        )}
      </div>
    </div>
  );
}

function FactCell({
  label,
  value,
  tone = "default",
  raw = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "evidence";
  raw?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-3.5", className)}>
      {/* Labels wrap rather than truncate — a clipped metric name is useless. */}
      <dt className="text-xs font-medium leading-4 text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">
        {raw ? value : <StatValue value={value} size="md" tone={tone} />}
      </dd>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const { t } = useTranslation();
  const filled = Math.round(rating);
  return (
    <span
      dir="ltr"
      className="inline-flex gap-px"
      role="img"
      aria-label={t("contributor.reputation.ratingAria", {
        rating: rating.toFixed(1),
      })}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < filled
              ? "fill-review-amber text-review-amber"
              : "fill-border text-border",
          )}
        />
      ))}
    </span>
  );
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/, "")}%`;
}
