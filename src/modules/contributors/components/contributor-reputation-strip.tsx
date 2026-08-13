import { Github, Star } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Stats side panel (screen-inventory §1.8 reputation data), styled as a
 * freelance-marketplace stats box: header bar, divider rows with the label
 * at the start and the value at the end, star rating, and percentage values.
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

  return (
    <div className="h-full overflow-hidden rounded-card border border-border bg-card">
      <h2 className="border-b border-border bg-background px-5 py-3.5 text-base font-bold text-foreground">
        {t("contributor.reputation.title")}
      </h2>
      <dl className="px-5">
        <StatRow label={t("contributor.reputation.ratings")}>
          {rating === null ? (
            <span className="text-sm text-muted-foreground">
              {t("contributor.reputation.new")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={rating} />
              <span dir="ltr" className="text-xs text-muted-foreground">
                ({reviewsCount})
              </span>
            </span>
          )}
        </StatRow>

        <StatRow label={t("contributor.reputation.completedContributions")}>
          <span className="text-sm font-bold text-foreground">
            {completedContributions}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.successRate")}>
          <span dir="ltr" className="text-sm font-bold text-foreground">
            {formatPercentage(successRate)}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.assignedTasks")}>
          <span className="text-sm font-medium text-foreground">
            {totalAssignedTasks}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.availability")}>
          <span className="text-sm font-medium text-foreground">
            {profile.availability ?? t("common.notSpecified")}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.githubAccount")} last>
          {profile.githubStatus.connected ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Github className="size-4" />
              {t("common.connected")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("common.disconnected")}
            </span>
          )}
        </StatRow>
      </dl>

      <div className="border-t border-border px-5 py-4">
        <h3 className="text-sm font-bold text-foreground">
          {t("contributor.reputation.topVerifiedSkills")}
        </h3>
        {topVerifiedSkills.length > 0 ? (
          <ol className="mt-3 flex flex-col gap-3">
            {topVerifiedSkills.map((skill) => (
              <li
                key={skill.name}
                className="flex items-center justify-between gap-3"
              >
                <span dir="ltr" className="font-mono text-xs text-foreground">
                  {skill.name}
                </span>
                <span className="text-end text-xs text-muted-foreground">
                  {t("contributor.reputation.verifiedContributions", {
                    count: skill.verifiedContributionCount,
                  })}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("contributor.reputation.noVerifiedSkills")}
          </p>
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3.5",
        !last && "border-b border-border",
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const { t } = useTranslation();
  const filled = Math.round(rating);
  return (
    <span
      dir="ltr"
      className="inline-flex"
      role="img"
      aria-label={t("contributor.reputation.ratingAria", {
        rating: rating.toFixed(1),
      })}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < filled
              ? "fill-amber-400 text-amber-400"
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
