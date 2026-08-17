import { ExternalLink, Github, UserRound, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PublicProjectDetailDto } from "../types/public-project.types";

interface PublicProjectSidebarProps {
  project: PublicProjectDetailDto;
}

/**
 * Keep the sidebar limited to data the public Project projection can prove.
 * Ratings and external project links require dedicated contracts.
 */
export function PublicProjectSidebar({ project }: PublicProjectSidebarProps) {
  const { t } = useTranslation();
  if (project.source.attributionStatus !== "public") return null;

  const { fullName, repositoryUrl, fetchedAt, statistics } = project.source;
  const sourceOwner = fullName.split("/")[0];

  return (
    <aside className="space-y-6">
      {project.owner && (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("project.detail.projectOwner", "Project Owner")}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            {project.owner.avatarUrl ? (
              <img src={project.owner.avatarUrl} alt="" className="size-11 rounded-full object-cover" />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" /></div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{project.owner.displayName}</p>
              {project.owner.username && <p dir="ltr" className="truncate font-mono text-xs text-muted-foreground">@{project.owner.username}</p>}
            </div>
          </div>
          <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{project.owner.publishedProjectsCount}</span>{" "}
            {t("project.detail.publishedProjects", "published projects")}
          </p>
        </section>
      )}
      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("project.detail.projectSource", "Project Source")}
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Github className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">@{sourceOwner}</p>
            <p dir="ltr" className="truncate font-mono text-xs text-muted-foreground">{fullName}</p>
          </div>
        </div>
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-fog"
        >
          {t("project.detail.openOnGithub", "Open on GitHub")}
          <ExternalLink className="size-3.5" />
        </a>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("project.detail.repositoryHealth", "Repository Health")}
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("project.detail.stars", "Stars")}</dt>
            <dd className="font-semibold text-foreground">{statistics.stars}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("project.detail.forks", "Forks")}</dt>
            <dd className="font-semibold text-foreground">{statistics.forks}</dd>
          </div>
          {statistics.contributors !== null && (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground"><Users className="size-3.5" />{t("project.detail.contributors", "Contributors")}</dt>
              <dd className="font-semibold text-foreground">{statistics.contributors}</dd>
            </div>
          )}
        </dl>
        {fetchedAt && (
          <p className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            {t("project.detail.lastFetched", "Last fetched:")} {new Date(fetchedAt).toLocaleDateString()}
          </p>
        )}
      </section>
    </aside>
  );
}
