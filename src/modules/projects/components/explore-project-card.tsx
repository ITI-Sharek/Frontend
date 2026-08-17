import { ExternalLink, GitFork, Star, Clock, CircleDot } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { cn } from "@/lib/utils";

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

function getForks(project: DiscoveredProjectDto): number | null {
  const forks = project.repoStatistics?.forks;
  return typeof forks === "number" && forks > 0 ? forks : null;
}

function getOpenIssues(project: DiscoveredProjectDto): number | null {
  const issues = project.repoStatistics?.openIssues;
  return typeof issues === "number" && issues > 0 ? issues : null;
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
  if (days === 1) return t("explore.publishedDaysAgo", { count: 1 });
  if (days < 30) return t("explore.publishedDaysAgo", { count: days });
  const months = Math.floor(days / 30);
  return months === 1
    ? t("explore.publishedMonthAgo")
    : t("explore.publishedMonthsAgo", { count: months });
}

/**
 * WF-03 card anatomy (comparison surface):
 * Category & Difficulty -> Title -> Description -> Language bar & Tech tags ->
 * Stats & Provenance -> Open Project CTA.
 */
export function ExploreProjectCard({
  project,
}: {
  project: DiscoveredProjectDto;
}) {
  const { t } = useTranslation();
  const languages = getLanguageShares(project.languages);
  const otherPercent = Math.max(
    0,
    100 - languages.reduce((sum, lang) => sum + lang.percent, 0),
  );
  const stars = getStars(project);
  const forks = getForks(project);
  const openIssues = getOpenIssues(project);
  const publishedAgo = formatPublishedAgo(t, project.publishedAt);
  const repoOwner = project.githubRepoUrl.split("/").slice(-2, -1)[0] ?? "";

  return (
    <article
      data-card-hover
      className="group flex flex-col justify-between rounded-card border border-border bg-card p-5 shadow-[var(--shadow-record)] transition-all duration-200 hover:border-border-strong sm:p-6"
    >
      <div>
        {/* Top Badges: Category & Difficulty */}
        <div className="flex items-center justify-between gap-2">
          {project.category !== null ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-subtle-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {getCategoryLabel(t, project.category)}
            </span>
          ) : (
            <span />
          )}

          {project.difficulty !== null && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                project.difficulty === "beginner" &&
                  "border border-evidence-teal/30 bg-evidence-soft text-evidence-soft-foreground",
                project.difficulty === "intermediate" &&
                  "border border-primary/20 bg-primary-soft text-primary-soft-foreground",
                project.difficulty === "advanced" &&
                  "border border-review-amber/30 bg-review-amber-soft text-review-amber",
              )}
            >
              {getDifficultyLabel(t, project.difficulty)}
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3 className="bidi mt-2.5 text-pretty text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          <a href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </a>
        </h3>

        {/* Description */}
        <p className="bidi mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {project.description ?? t("explore.noDescription")}
        </p>

        {/* Language Breakdown Bar */}
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
                  <span className="tnum font-mono text-[10.5px]">
                    {lang.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack Chips */}
        {project.technologies.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 6).map((tech) => (
              <span
                key={tech}
                dir="ltr"
                className="rounded-md border border-border bg-surface-fog px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/30"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 6 && (
              <span
                dir="ltr"
                className="rounded-md border border-border bg-surface-fog px-1.5 py-0.5 font-mono text-[10.5px] text-subtle-foreground"
              >
                +{project.technologies.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Statistics & Provenance Footer */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-subtle-foreground">
          {stars !== null && (
            <span
              className="inline-flex items-center gap-1 font-mono"
              title={`${stars} stars`}
            >
              <Star className="size-3.5 text-review-amber fill-review-amber/20" />
              <bdi className="tnum font-semibold text-foreground/80">
                {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
              </bdi>
            </span>
          )}

          {forks !== null && (
            <span
              className="inline-flex items-center gap-1 font-mono"
              title={`${forks} forks`}
            >
              <GitFork className="size-3.5 text-muted-foreground" />
              <bdi className="tnum font-semibold text-foreground/80">
                {forks >= 1000 ? `${(forks / 1000).toFixed(1)}k` : forks}
              </bdi>
            </span>
          )}

          {openIssues !== null && (
            <span
              className="inline-flex items-center gap-1 font-mono"
              title={`${openIssues} open issues`}
            >
              <CircleDot className="size-3.5 text-muted-foreground" />
              <bdi className="tnum font-semibold text-foreground/80">
                {openIssues}
              </bdi>
            </span>
          )}

          {publishedAgo !== null && (
            <span className="inline-flex items-center gap-1 text-[11.5px]">
              <Clock className="size-3 text-muted-foreground" />
              <span>{t("explore.publishedAgo", { time: publishedAgo })}</span>
            </span>
          )}

          {repoOwner !== "" && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              className="ms-auto inline-flex items-center gap-1 font-mono text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3" />@{repoOwner}
            </a>
          )}
        </div>

        {/* CTA Action */}
        <div className="mt-4">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full justify-between hover:border-primary hover:bg-primary-soft font-semibold"
          >
            <a href={`/projects/${project.slug}`}>
              <span>{t("explore.openProject")}</span>
              <DirectionalArrow className="transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
