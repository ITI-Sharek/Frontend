import { ExternalLink, FileCode2, Folder, Github } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PublicProjectDetailDto } from "../types/public-project.types";

export function PublicProjectFilesTab({ project }: { project: PublicProjectDetailDto }) {
  const { t } = useTranslation();
  if (project.source.attributionStatus !== "public") {
    return <Unavailable message={t("project.detail.sourceUnavailable", "Details about this project's source are not available to view right now.")} />;
  }

  const {
    rootEntries,
    defaultBranch,
    rootEntriesUnavailableReason,
    treeEntries,
    treeTruncated,
    treeUnavailableReason,
  } = project.source.statistics;
  const treeSnapshotAvailable = treeEntries.length > 0;
  const entries = treeSnapshotAvailable
    ? treeEntries.map((entry) => ({
        ...entry,
        name: entry.path.split("/").at(-1) ?? entry.path,
        depth: entry.path.split("/").length - 1,
      }))
    : rootEntries.map((entry) => ({ ...entry, depth: 0 }));
  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-[var(--shadow-record)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 p-5">
        <div>
          <h2 className="text-base font-bold text-foreground sm:text-lg">{t("project.detail.repositoryFiles", "Repository Files")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {defaultBranch ? `${t("project.detail.branch", "Branch")}: ${defaultBranch}` : t("project.detail.branchUnavailable", "Default branch unavailable")}
          </p>
        </div>
        <a href={project.source.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-fog">
          <Github className="size-4" /> {t("project.detail.openOnGithub", "Open on GitHub")} <ExternalLink className="size-3.5" />
        </a>
      </header>
      {entries.length === 0 ? (
        <p className="p-5 text-sm leading-6 text-muted-foreground">
          {treeUnavailableReason || rootEntriesUnavailableReason
            ? t("project.detail.filesUnavailable", "The repository file snapshot is currently unavailable. Refresh the source and try again.")
            : t("project.detail.filesEmpty", "This repository has no indexed root entries yet.")}
        </p>
      ) : (
        <>
          {treeSnapshotAvailable && treeTruncated && (
            <p className="border-b border-border/60 px-5 py-3 text-xs leading-5 text-muted-foreground">
              {t("project.detail.filesPartial", "This source snapshot is large, so only the first 500 paths are shown.")}
            </p>
          )}
          <ul className="divide-y divide-border/60">
          {entries.map((entry) => {
            return (
            <li key={entry.path} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-2.5">
                {entry.type === "directory" ? <Folder className="size-4 shrink-0 text-primary" /> : <FileCode2 className="size-4 shrink-0 text-muted-foreground" />}
                {entry.url ? <a href={entry.url} target="_blank" rel="noreferrer" dir="ltr" className="truncate font-mono text-xs font-semibold text-foreground hover:text-primary" style={{ paddingInlineStart: `${entry.depth * 12}px` }}>{entry.name}</a> : <span dir="ltr" className="truncate font-mono text-xs font-semibold text-foreground" style={{ paddingInlineStart: `${entry.depth * 12}px` }}>{entry.name}</span>}
              </div>
              {entry.size !== null && <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(entry.size)}</span>}
            </li>
            );
          })}
          </ul>
        </>
      )}
    </section>
  );
}

function Unavailable({ message }: { message: string }) {
  return <section className="rounded-2xl border border-border/80 bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-record)]">{message}</section>;
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
