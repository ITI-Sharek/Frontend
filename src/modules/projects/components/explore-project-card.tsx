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
  viewMode = "3",
}: {
  project: DiscoveredProjectDto;
  viewMode?: "1" | "2" | "3";
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

  const isListMode = viewMode === "1";

  return (
    <article
      data-card-hover
      className={cn(
        "group flex justify-between rounded-2xl border border-border bg-card shadow-[var(--shadow-record)] transition-all duration-200 hover:border-border-strong hover:shadow-md",
        isListMode
          ? "flex-col gap-6 p-6 md:flex-row md:items-center"
          : "flex-col p-5 sm:p-6",
      )}
    >
      {/* Main Content Area */}
      <div className={cn("min-w-0 flex-1", isListMode && "space-y-3")}>
        {/* Top Badges: Category & Difficulty */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {project.category !== null ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-foreground/80">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              {getCategoryLabel(t, project.category)}
            </span>
          ) : (
            <span />
          )}

          {project.difficulty !== null && (
            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-bold shadow-xs",
                project.difficulty === "beginner" &&
                  "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                project.difficulty === "intermediate" &&
                  "border border-primary/30 bg-primary/10 text-primary",
                project.difficulty === "advanced" &&
                  "border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
              )}
            >
              {getDifficultyLabel(t, project.difficulty)}
            </span>
          )}
        </div>

        {/* Project Title */}
        <h3 className="bidi mt-3 text-pretty text-xl font-black leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
          <a href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </a>
        </h3>

        {/* Description */}
        <p className="bidi mt-2.5 text-pretty text-sm font-medium leading-relaxed text-muted-foreground/90 sm:text-[15px]">
          {project.description ?? t("explore.noDescription")}
        </p>

        {/* Language Breakdown Bar */}
        {languages.length > 0 && (
          <div className="mt-4">
            <div
              className="flex h-2 gap-px overflow-hidden rounded-full bg-surface-muted"
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
              className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5"
            >
              {languages.map((lang) => (
                <li
                  key={lang.name}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: getLanguageColor(lang.name) }}
                  />
                  <span className="font-bold text-foreground">{lang.name}</span>
                  <span className="tnum font-mono text-xs font-semibold">
                    {lang.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack Chips (in non-list mode or bottom of left side) */}
        {project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, isListMode ? 10 : 6).map((tech) => (
              <span
                key={tech}
                dir="ltr"
                className="rounded-lg border border-border/80 bg-surface-fog px-2.5 py-1 font-mono text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/40"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > (isListMode ? 10 : 6) && (
              <span
                dir="ltr"
                className="rounded-lg border border-border/80 bg-surface-fog px-2 py-1 font-mono text-xs font-bold text-muted-foreground"
              >
                +{project.technologies.length - (isListMode ? 10 : 6)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right / Bottom Action Rail */}
      <div
        className={cn(
          "flex flex-col justify-between",
          isListMode
            ? "shrink-0 gap-5 md:w-64 md:border-s md:border-border md:ps-6 rtl:md:border-s-0 rtl:md:border-e rtl:md:ps-0 rtl:md:pe-6"
            : "mt-5 border-t border-border pt-4",
        )}
      >
        {/* Statistics & Provenance Footer */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground">
          {stars !== null && (
            <span
              className="inline-flex items-center gap-1.5 font-mono text-sm"
              title={`${stars} stars`}
            >
              <Star className="size-4 fill-review-amber text-review-amber" />
              <bdi className="tnum font-bold text-foreground">
                {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
              </bdi>
            </span>
          )}

          {forks !== null && (
            <span
              className="inline-flex items-center gap-1.5 font-mono text-sm"
              title={`${forks} forks`}
            >
              <GitFork className="size-4 text-foreground/70" />
              <bdi className="tnum font-bold text-foreground">
                {forks >= 1000 ? `${(forks / 1000).toFixed(1)}k` : forks}
              </bdi>
            </span>
          )}

          {openIssues !== null && (
            <span
              className="inline-flex items-center gap-1.5 font-mono text-sm"
              title={`${openIssues} open issues`}
            >
              <CircleDot className="size-4 text-foreground/70" />
              <bdi className="tnum font-bold text-foreground">{openIssues}</bdi>
            </span>
          )}

          {publishedAgo !== null && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{t("explore.publishedAgo", { time: publishedAgo })}</span>
            </span>
          )}

          {repoOwner !== "" && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              className="inline-flex items-center gap-1 font-mono text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />@{repoOwner}
            </a>
          )}
        </div>

        {/* CTA Action */}
        <div className="mt-4">
          <Button
            asChild
            size="lg"
            className="w-full justify-between rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            <a href={`/projects/${project.slug}`}>
              <span>{t("explore.openProject")}</span>
              <DirectionalArrow className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
