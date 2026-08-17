import { ExternalLink, Star } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";

import { getCategoryLabel, getDifficultyLabel } from "./explore-filters";
import { getLanguageColor } from "../utils/language-colors";
import type { DiscoveredProjectDto } from "../types/explore.types";

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

function formatPublishedAgo(t: TFunction, publishedAt: string | null): string | null {
  if (publishedAt === null) return null;
  const days = Math.floor(
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return t("explore.publishedToday");
  if (days === 1) return t("explore.publishedDaysAgo", { count: 1 });
  if (days < 30) return t("explore.publishedDaysAgo", { count: days });
  const months = Math.floor(days / 30);
  return months === 1
    ? t("explore.publishedMonthAgo")
    : t("explore.publishedMonthsAgo", { count: months });
}

/**
 * WF-03 card anatomy (comparison surface): title → difficulty + category
 * chips → description → language bar + tech tags → stats · owner repo link.
 */
export function ExploreProjectCard({
  project,
}: {
  project: DiscoveredProjectDto;
}) {
  const { t } = useTranslation();
  const languages = getLanguageShares(project.languages);
  const otherPercent =
    100 - languages.reduce((sum, lang) => sum + lang.percent, 0);
  const stars = getStars(project);
  const publishedAgo = formatPublishedAgo(t, project.publishedAt);
  const repoOwner = project.githubRepoUrl.split("/").slice(-2, -1)[0] ?? "";

  return (
    <article
      data-card-hover
      className="group flex flex-col rounded-card border border-border bg-card p-5 shadow-[var(--shadow-record)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="bidi text-pretty text-lg font-bold leading-snug text-foreground">
          {project.title}
        </h3>
        {project.difficulty !== null && (
          <span className="shrink-0 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-soft-foreground">
            {getDifficultyLabel(t, project.difficulty)}
          </span>
        )}
      </div>

      {project.category !== null && (
        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
          {getCategoryLabel(t, project.category)}
        </p>
      )}

      <p className="bidi mt-3 text-sm leading-6 text-muted-foreground">
        {project.description ?? t("explore.noDescription")}
      </p>

      {/*
       * Repository composition, drawn the way GitHub draws it: one bar in the
       * languages' own colours, with a keyed legend underneath. The colours do
       * the identifying, so the legend can stay small.
       */}
      {languages.length > 0 && (
        <div className="mt-4">
          <div
            className="flex h-1.5 gap-px overflow-hidden rounded-full bg-surface-muted"
            aria-hidden
          >
            {languages.map((lang) => (
              <span
                key={lang.name}
                style={{
                  width: `${lang.percent}%`,
                  background: getLanguageColor(lang.name),
                }}
              />
            ))}
            {otherPercent > 0 && (
              <span
                style={{
                  width: `${otherPercent}%`,
                  background: "var(--border-strong)",
                }}
              />
            )}
          </div>
          <ul
            dir="ltr"
            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"
          >
            {languages.map((lang) => (
              <li
                key={lang.name}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: getLanguageColor(lang.name) }}
                />
                <span className="font-medium text-foreground">{lang.name}</span>
                <span className="tnum">{lang.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            dir="ltr"
            className="rounded-social border border-border bg-surface-fog px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-subtle-foreground">
        {stars !== null && (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 text-review-amber" />
            <bdi className="tnum font-semibold text-muted-foreground">
              {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
            </bdi>
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
            className="ms-auto inline-flex items-center gap-1 font-mono text-[11px] transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3" />@{repoOwner}
          </a>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="w-full justify-between"
        >
          {/* URL contract per DEC-025: /projects/:projectSlug */}
          <a href={`/projects/${project.slug}`}>
            {t("explore.openProject")}
            <DirectionalArrow className="transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </a>
        </Button>
      </div>
    </article>
  );
}
