import {
  ArrowRight,
  ExternalLink,
  FolderGit2,
  Github,
  GitBranch,
  LockKeyhole,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorGithubReposCard({
  profile,
  onViewAll,
}: {
  profile: ContributorProfileDto;
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();

  const repositories = Array.from(
    new Map(
      profile.githubInstallations
        .flatMap((installation) => installation.repositories)
        .map((repository) => [repository.repositoryId, repository]),
    ).values(),
  );
  const visibleRepositories = onViewAll ? repositories.slice(0, 4) : repositories;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Github className="size-5 text-slate-900 dark:text-white" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("contributor.dynamic.githubRepositories")}
          </h2>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {t("contributor.dynamic.repositoryCount", { count: repositories.length })}
          </span>
        </div>

        {onViewAll && repositories.length > 0 && <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          <span>{t("common.viewAll") || "View All"}</span>
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </button>}
      </div>

      {/* Grid of 4 Repo cards */}
      {visibleRepositories.length > 0 ? <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleRepositories.map((repo) => {
          const name = repo.fullName.split("/").at(-1) ?? repo.fullName;
          return (
          <a
            key={repo.repositoryId}
            href={`https://github.com/${repo.fullName}`}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div>
              {/* Top title with external icon */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FolderGit2 className="size-4 shrink-0 text-slate-800 dark:text-slate-200" />
                  <span
                    dir="ltr"
                    className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                  >
                    {name}
                  </span>
                </div>
                <ExternalLink className="size-3 shrink-0 text-slate-400 opacity-70 group-hover:opacity-100" />
              </div>

              <p dir="ltr" className="mt-2 truncate text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {repo.fullName}
              </p>
            </div>

            {/* Bottom: Language & Stars/Forks */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                {repo.visibility === "private" ? <LockKeyhole className="size-3" /> : <Github className="size-3" />}
                <span>{repo.visibility}</span>
              </div>

              {repo.defaultBranch && <span dir="ltr" className="inline-flex items-center gap-1 font-mono">
                <GitBranch className="size-3 text-slate-400" />
                {repo.defaultBranch}
              </span>}
            </div>
          </a>
          );
        })}
      </div> : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {profile.viewerRelationship === "owner"
            ? t("contributor.dynamic.noRepositoriesOwner")
            : t("contributor.dynamic.noRepositoriesViewer")}
        </p>
      )}
    </div>
  );
}
