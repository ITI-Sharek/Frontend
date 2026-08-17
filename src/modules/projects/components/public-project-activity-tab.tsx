import { GitCommit, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PublicProjectDetailDto } from "../types/public-project.types";

export function PublicProjectActivityTab({ project }: { project: PublicProjectDetailDto }) {
  const { t, i18n } = useTranslation();
  if (project.source.attributionStatus !== "public") {
    return <section className="rounded-2xl border border-border/80 bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-record)]">{t("project.detail.sourceUnavailable", "Details about this project's source are not available to view right now.")}</section>;
  }
  const commits = project.source.statistics.recentCommits;
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-record)]">
      <h2 className="text-base font-bold text-foreground sm:text-lg">{t("project.detail.activity", "Activity")}</h2>
      {commits.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("project.detail.activitySnapshotPending", "Recent commits will appear here after the next successful source refresh.")}</p>
      ) : (
        <ol className="mt-5 space-y-3">
          {commits.map((commit) => (
            <li key={commit.sha} className="flex gap-3 rounded-xl border border-border/70 p-3">
              <GitCommit className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{commit.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{commit.author ?? t("project.detail.unknownAuthor", "Unknown author")}{commit.authoredAt ? ` · ${new Date(commit.authoredAt).toLocaleDateString(i18n.language)}` : ""}</p>
              </div>
              {commit.url && <a href={commit.url} target="_blank" rel="noreferrer" aria-label={t("project.detail.openCommit", "Open commit")} className="text-muted-foreground hover:text-primary"><ExternalLink className="size-4" /></a>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
