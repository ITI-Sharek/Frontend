import {
  Activity,
  Award,
  CheckCircle2,
  FolderGit2,
  GitPullRequest,
  Percent,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorStatsCard({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
  const repositoriesCount = new Set(
    profile.githubInstallations.flatMap((installation) =>
      installation.repositories.map((repository) => repository.repositoryId),
    ),
  ).size;
  const {
    completedContributions,
    totalAssignedTasks,
    successRate,
    rating,
    reviewsCount,
  } = profile.reputationSummary;

  const isOwner = profile.viewerRelationship === "owner";

  const metrics = [
    {
      label: t("contributor.dynamic.completedContributions"),
      value: completedContributions,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/30",
    },
    {
      label: t("contributor.dynamic.assignedRequests"),
      value: totalAssignedTasks,
      icon: GitPullRequest,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      borderColor: "hover:border-primary/30",
    },
    ...(isOwner
      ? [
          {
            label: t("contributor.dynamic.connectedRepositories"),
            value: repositoriesCount,
            icon: FolderGit2,
            iconColor: "text-sky-600 dark:text-sky-400",
            iconBg: "bg-sky-500/10",
            borderColor: "hover:border-sky-500/30",
          },
        ]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Activity className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t("contributor.dynamic.contributionStats")}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {t("contributor.dynamic.statsSubtitle", "Verified performance summary")}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-evidence-teal/20 bg-evidence-teal/10 px-2 py-0.5 font-mono text-[10px] font-bold text-evidence-teal">
          <Sparkles className="size-2.5" />
          <span>{t("contributor.dynamic.verifiedStats", "Verified")}</span>
        </span>
      </div>

      {/* ── Primary KPI Metrics ── */}
      <div
        className={cn(
          "mt-4 grid gap-2.5",
          metrics.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {metrics.map(
          ({ label, value, icon: Icon, iconColor, iconBg, borderColor }) => (
            <div
              key={label}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface-fog p-3 transition-all hover:bg-surface-muted sm:p-3.5",
                borderColor,
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-transform group-hover:scale-105",
                    iconBg,
                    iconColor,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="tnum font-mono text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* ── Performance & Quality Panel ── */}
      <div className="mt-4 space-y-3.5 rounded-xl border border-border/70 bg-surface-fog/60 p-3.5 sm:p-4">
        {/* Success Rate with Visual Meter */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Percent className="size-3.5 text-evidence-teal" />
              <span>{t("contributor.dynamic.successRate")}</span>
            </span>
            <span dir="ltr" className="tnum font-mono font-bold text-foreground">
              {successRate.toFixed(1).replace(/\.0$/, "")}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, successRate))}%` }}
            />
          </div>
        </div>

        {/* Rating with Score / Stars / 'New' state */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Award className="size-3.5 text-review-amber" />
            <span>{t("contributor.dynamic.rating")}</span>
          </span>
          {rating === null ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
              {t("contributor.reputation.new")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
              <span>{rating.toFixed(1)}</span>
              <Star className="size-3.5 fill-review-amber text-review-amber" />
              {reviewsCount > 0 && (
                <span className="text-[10px] font-normal text-muted-foreground">
                  ({reviewsCount})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
