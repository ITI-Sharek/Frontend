import { BadgeCheck, Bookmark, Star } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "./explore-filters";
import type { ExploreProjectDto, FitBucket } from "../types/explore.types";

const LANGUAGE_BAR_COLORS = [
  "var(--primary)",
  "var(--brand-indigo)",
  "var(--border)",
];

const FIT_META: Record<FitBucket, { label: string; className: string }> = {
  strong: { label: "توافق قوي", className: "text-advisory-violet" },
  partial: {
    label: "توافق جزئي",
    className: "text-amber-600 dark:text-amber-400",
  },
  low: { label: "توافق منخفض", className: "text-muted-foreground" },
  unknown: { label: "التوافق غير معروف", className: "text-muted-foreground" },
};

/**
 * WF-03 card anatomy (fixed order, comparison surface): name → difficulty +
 * category chips → description → language bar + tech tags → stats · open
 * tasks · owner → fit hint (authed only, explained — DEC-010).
 */
export function ExploreProjectCard({ project }: { project: ExploreProjectDto }) {
  const fit = project.fitHint === null ? null : FIT_META[project.fitHint.bucket];
  const otherPercent =
    100 - project.languages.reduce((sum, lang) => sum + lang.percent, 0);

  return (
    <article className="flex flex-col rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex flex-wrap items-center gap-2">
        <h3 dir="ltr" className="font-mono text-[15px] font-bold tracking-[0.65px] text-foreground">
          {project.name}
        </h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {DIFFICULTY_LABELS[project.difficulty]}
        </span>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          {CATEGORY_LABELS[project.category]}
        </span>
        <button
          type="button"
          aria-label="حفظ المشروع"
          className="ms-auto text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bookmark className="size-4.5" />
        </button>
      </div>

      <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border/50" aria-hidden>
        {project.languages.map((lang, index) => (
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
        {project.languages.map((lang) => `${lang.name} ${lang.percent}%`).join(" · ")}
      </p>

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
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5" />
          <bdi>{project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}k` : project.stars}</bdi>
        </span>
        <span>{project.commitsThisMonth} commit هذا الشهر</span>
        <span>آخر تحديث {project.updatedAgoLabel}</span>
        <span className="font-medium text-foreground">
          {project.openTasksCount} مهام مفتوحة
        </span>
        <span dir="ltr" className="font-mono text-[11px] tracking-[0.65px]">
          @{project.ownerUsername}
        </span>
      </div>

      {project.fitHint !== null && fit !== null && (
        <div className="mt-3 border-t border-border pt-3">
          <p className={cn("flex items-center gap-1.5 text-sm font-bold", fit.className)}>
            {project.fitHint.bucket === "strong" && <BadgeCheck className="size-4" />}
            {fit.label}
            {project.fitHint.requiredCount > 0 && (
              <span dir="ltr" className="font-mono text-[11px] font-normal tracking-[0.65px] text-muted-foreground">
                {project.fitHint.matchedCount}/{project.fitHint.requiredCount}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {project.fitHint.reason}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          {/* URL contract per DEC-025: /projects/:projectSlug */}
          <a href={`/projects/${project.slug}`}>فتح المشروع</a>
        </Button>
        <Button size="sm" variant="outline">
          حفظ
        </Button>
      </div>
    </article>
  );
}
