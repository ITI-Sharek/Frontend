import { Github, Star } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Stats side panel (screen-inventory §1.8 reputation data), styled as a
 * freelance-marketplace stats box: header bar, divider rows with the label
 * at the start and the value at the end, star rating, and percentage chips.
 * Only real API data — success rate (FR-070) is omitted until the backend
 * exposes it.
 */
export function ContributorReputationStrip({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
  const { rating, reviewsCount } = profile.reputationSummary;
  const verifiedCount = profile.skills.filter(
    (skill) => skill.status === "approved",
  ).length;
  const verifiedPercent =
    profile.skills.length === 0
      ? null
      : Math.round((verifiedCount / profile.skills.length) * 100);

  return (
    <div className="h-full overflow-hidden rounded-card border border-border bg-card">
      <h2 className="border-b border-border bg-background px-5 py-3.5 text-base font-bold text-foreground">
        {t("contributor.reputation.title")}
      </h2>
      <dl className="px-5">
        <StatRow label={t("contributor.reputation.ratings")}>
          {rating === null ? (
            <span className="text-sm text-muted-foreground">{t("contributor.reputation.new")}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={rating} />
              <span dir="ltr" className="text-xs text-muted-foreground">
                ({reviewsCount})
              </span>
            </span>
          )}
        </StatRow>

        <StatRow label={t("contributor.reputation.verifiedSkills")}>
          {verifiedPercent === null ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            <PercentChip percent={verifiedPercent} />
          )}
        </StatRow>

        <StatRow label={t("contributor.reputation.completedContributions")}>
          <span className="text-sm font-bold text-foreground">
            {profile.contributionHistory.length}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.availability")}>
          <span className="text-sm font-medium text-foreground">
            {profile.availability ?? t("contributor.profile.unspecified")}
          </span>
        </StatRow>

        <StatRow label={t("contributor.reputation.githubAccount")} last>
          {profile.githubStatus.connected ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Github className="size-4" />
              {t("contributor.githubStatus.connected")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{t("contributor.githubStatus.disconnected")}</span>
          )}
        </StatRow>
      </dl>
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

function PercentChip({ percent }: { percent: number }) {
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-block min-w-14 rounded-sm px-2 py-1 text-center font-mono text-[11px] leading-none tracking-[0.65px]",
        percent >= 60
          ? "bg-evidence-teal/15 text-evidence-teal"
          : "bg-border/60 text-muted-foreground",
      )}
    >
      {percent}%
    </span>
  );
}
