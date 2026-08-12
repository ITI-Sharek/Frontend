import { ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { getCategoryLabel, getDifficultyLabel } from "./explore-filters";
import type { PublicProjectDetailDto } from "../types/public-project.types";

function formatPublishedDate(publishedAt: string, locale: string): string {
  return new Date(publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PublicProjectDetailViewProps {
  project: PublicProjectDetailDto;
  exploreHref: string;
  proposalAction?: ReactNode;
}

/**
 * Minimal, honest public project presentation (SK-112 contract §10): renders
 * only `PublicProjectDetailDto`'s allowlisted fields. Contribution
 * requests/tasks, owner identity, stars, and fit hints are a separate,
 * not-yet-implemented discovery-detail feature and must never be fabricated
 * here — the public contract does not return them.
 */
export function PublicProjectDetailView({
  project,
  exploreHref,
  proposalAction,
}: PublicProjectDetailViewProps) {
  const { t, i18n } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
      <a
        href={exploreHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        {t("project.detail.backToExplore")}
      </a>

      <header className="rounded-card border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            dir="ltr"
            className="font-mono text-xl font-bold tracking-[0.65px] text-foreground"
          >
            {project.title}
          </h1>
          {project.difficulty !== null && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {getDifficultyLabel(t, project.difficulty)}
            </span>
          )}
          {project.category !== null && (
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {getCategoryLabel(t, project.category)}
            </span>
          )}
          {project.source.attributionStatus === "public" && (
            <a
              dir="ltr"
              href={project.source.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="ms-auto inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.65px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              {t("project.detail.openOnGithub")}
            </a>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {t("project.detail.publishedOn", {
            date: formatPublishedDate(project.publishedAt, i18n.language),
          })}
        </p>

        {(project.technologies.length > 0 || project.tags.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={`tech-${tech}`}
                dir="ltr"
                className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.tags.map((tag) => (
              <span
                key={`tag-${tag}`}
                className="rounded-full bg-border/40 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {proposalAction && (
        <section className="rounded-card border border-primary/25 bg-primary/5 p-5">
          {proposalAction}
        </section>
      )}

      <section className="rounded-card border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">{t("project.detail.overview")}</h2>
        <p className="mt-3 leading-8 text-muted-foreground">
          {project.description ?? t("explore.noDescription")}
        </p>
      </section>

      <section className="rounded-card border border-border bg-card p-6">
        <h2 className="text-sm font-bold text-foreground">{t("project.source.title")}</h2>
        {project.source.attributionStatus === "public" ? (
          <>
            <p
              dir="ltr"
              className="mt-2 text-end font-mono text-sm tracking-[0.65px] text-foreground"
            >
              {project.source.fullName}
            </p>
            {project.source.fetchedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("project.detail.lastFetched")}{" "}
                {new Date(project.source.fetchedAt).toLocaleString(i18n.language)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("project.detail.sourceUnavailable")}
          </p>
        )}
      </section>
    </div>
  );
}
