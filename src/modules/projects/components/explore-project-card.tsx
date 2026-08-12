import type { TFunction } from "i18next";
import { Bookmark, ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { getCategoryLabel, getDifficultyLabel } from "./explore-filters";
import type { DiscoveredProjectDto } from "../types/explore.types";

const LANGUAGE_BAR_COLORS = [
  "var(--primary)",
  "var(--brand-indigo)",
  "var(--border)",
];

const MAX_LANGUAGES_SHOWN = 3;

function getLanguageShares(
  languages: Record<string, number>,
): { name: string; percent: number }[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (total <= 0) return [];

  return Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_LANGUAGES_SHOWN)
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / total) * 100),
    }));
}

function getStars(project: DiscoveredProjectDto): number | null {
  const stars = project.repoStatistics?.stars;
  return typeof stars === "number" ? stars : null;
}

function formatPublishedAgo(
  t: TFunction,
  publishedAt: string | null,
): string | null {
  if (publishedAt === null) return null;
  const days = Math.floor(
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return t("explore.publishedToday");
  if (days === 1) return t("explore.publishedDaysAgo_one", { count: 1 });
  if (days < 30) return t("explore.publishedDaysAgo_other", { count: days });
  const months = Math.floor(days / 30);
  return months === 1
    ? t("explore.publishedMonthAgo", { count: 1 })
    : t("explore.publishedMonthsAgo", { count: months });
}

/**
 * WF-03 card anatomy (comparison surface): title → difficulty + category
 * chips → description → language bar + tech tags → stats · owner repo link.
 */
export function ExploreProjectCard({ project }: { project: DiscoveredProjectDto }) {
  const { t } = useTranslation();
  const languages = getLanguageShares(project.languages);
  const otherPercent = 100 - languages.reduce((sum, lang) => sum + lang.percent, 0);
  const stars = getStars(project);
  const publishedAgo = formatPublishedAgo(t, project.publishedAt);
  const repoOwner = project.githubRepoUrl.split("/").slice(-2, -1)[0] ?? "";

  return (
    <article className="flex flex-col rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex flex-wrap items-center gap-2">
        <h3 dir="ltr" className="font-mono text-[15px] font-bold tracking-[0.65px] text-foreground">
          {project.title}
        </h3>
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
        <button
          type="button"
          aria-label={t("explore.saveProjectAria")}
          className="ms-auto text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bookmark className="size-4.5" />
        </button>
      </div>

      <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
        {project.description ?? t("explore.noDescription")}
      </p>

      {languages.length > 0 && (
        <>
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border/50" aria-hidden>
            {languages.map((lang, index) => (
              <span
                key={lang.name}
                style={{
                  width: `${lang.percent}%`,
                  background: LANGUAGE_BAR_COLORS[index % LANGUAGE_BAR_COLORS.length],
                }}
              />
            ))}
            {otherPercent > 0 && <span style={{ width: `${otherPercent}%` }} />}
          </div>
          <p dir="ltr" className="mt-1.5 text-end font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
            {languages.map((lang) => `${lang.name} ${lang.percent}%`).join(" · ")}
          </p>
        </>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            dir="ltr"
            className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {stars !== null && (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" />
            <bdi>{stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}</bdi>
          </span>
        )}
        {publishedAgo !== null && (
          <span>{t("explore.publishedAgo", { time: publishedAgo })}</span>
        )}
        {repoOwner !== "" && (
          <a
            href={project.githubRepoUrl}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.65px] hover:text-foreground"
          >
            <ExternalLink className="size-3" />@{repoOwner}
          </a>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          {/* URL contract per DEC-025: /projects/:projectSlug */}
          <a href={`/projects/${project.slug}`}>{t("explore.openProject")}</a>
        </Button>
        <Button size="sm" variant="outline">
          {t("explore.saveProject")}
        </Button>
      </div>
    </article>
  );
}
