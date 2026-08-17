import { CheckCircle2, FolderGit2, ListChecks, Smile, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { completedContributions, totalAssignedTasks, successRate, rating } =
    profile.reputationSummary;

  const metrics = [
    {
      label: t("contributor.dynamic.completedContributions"),
      value: completedContributions,
      icon: CheckCircle2,
    },
    {
      label: t("contributor.dynamic.assignedRequests"),
      value: totalAssignedTasks,
      icon: ListChecks,
    },
    ...(profile.viewerRelationship === "owner"
      ? [{
          label: t("contributor.dynamic.connectedRepositories"),
          value: repositoriesCount,
          icon: FolderGit2,
        }]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Smile className="size-4.5 text-slate-800 dark:text-slate-200" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t("contributor.dynamic.contributionStats")}
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
            <Icon className="size-4 text-blue-600 dark:text-blue-400" />
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-xs dark:divide-slate-800 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 py-3">
          <dt className="text-slate-500 dark:text-slate-400">{t("contributor.dynamic.successRate")}</dt>
          <dd dir="ltr" className="font-semibold text-slate-900 dark:text-white">{successRate.toFixed(1).replace(/\.0$/, "")}%</dd>
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <dt className="text-slate-500 dark:text-slate-400">{t("contributor.dynamic.rating")}</dt>
          <dd className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
            {rating === null ? t("contributor.reputation.new") : rating.toFixed(1)}
            {rating !== null && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
          </dd>
        </div>
      </dl>
    </div>
  );
}
