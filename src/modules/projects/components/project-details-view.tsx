import {
  Archive,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  GitCommitHorizontal,
  Star,
} from "lucide-react";

import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "./explore-filters";
import type { ProjectDetailsDto, ProjectTaskSummaryDto } from "../types/project-details.types";
import type { FitBucket } from "../types/explore.types";

const FIT_META: Record<FitBucket, { label: string; className: string }> = {
  strong: { label: "توافق قوي", className: "text-advisory-violet" },
  partial: { label: "توافق جزئي", className: "text-amber-600 dark:text-amber-400" },
  low: { label: "توافق منخفض", className: "text-muted-foreground" },
  unknown: { label: "التوافق غير معروف", className: "text-muted-foreground" },
};

interface ProjectDetailsViewProps {
  project: ProjectDetailsDto;
  exploreHref: string;
  getTaskHref: (taskId: string) => string;
}

/**
 * WF-04 project details: evaluate "is this worth my time, can I qualify?"
 * Header → overview → open tasks with per-task fit → owner card.
 */
export function ProjectDetailsView({
  project,
  exploreHref,
  getTaskHref,
}: ProjectDetailsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 md:px-6">
      <a
        href={exploreHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        العودة إلى الاستكشاف
      </a>

      {project.archived && (
        <div className="flex items-center gap-3 rounded-card border border-border bg-border/20 px-4 py-3 text-sm text-muted-foreground">
          <Archive className="size-4 shrink-0" />
          هذا المشروع لم يعد يستقبل مساهمات جديدة — السجل محفوظ للاطلاع.
        </div>
      )}

      <header className="rounded-card border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 dir="ltr" className="font-mono text-xl font-bold tracking-[0.65px] text-foreground">
            {project.name}
          </h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {DIFFICULTY_LABELS[project.difficulty]}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
            {CATEGORY_LABELS[project.category]}
          </span>
          <a
            dir="ltr"
            href={`https://github.com/${project.ownerUsername}/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="ms-auto inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.65px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            فتح على GitHub
          </a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4" />
            <bdi>{project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}k` : project.stars}</bdi>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitCommitHorizontal className="size-4" />
            {project.commitsThisMonth} commit هذا الشهر
          </span>
          <span>آخر تحديث {project.updatedAgoLabel}</span>
        </div>

        <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-border/50" aria-hidden>
          {project.languages.map((lang, index) => (
            <span
              key={lang.name}
              style={{
                width: `${lang.percent}%`,
                background: index === 0 ? "var(--primary)" : "var(--brand-indigo)",
              }}
            />
          ))}
        </div>
        <p dir="ltr" className="mt-1.5 text-end font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
          {project.languages.map((lang) => `${lang.name} ${lang.percent}%`).join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
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
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-card border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">نظرة عامة</h2>
            <p className="mt-3 leading-8 text-muted-foreground">
              {project.readmeDigest}
            </p>
          </section>

          <section id="tasks" className="rounded-card border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">
                المهام المفتوحة
              </h2>
              <span className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
                {project.openTasks.length}
              </span>
            </div>
            {project.openTasks.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {project.openTasks.map((task) => (
                  <TaskRow key={task.id} task={task} href={getTaskHref(task.id)} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                لا توجد مهام مفتوحة حاليًا — احفظ المشروع وسنخبرك عند نشر مهمة
                جديدة.
              </p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="h-fit rounded-card border border-border bg-card p-5">
            <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              صاحب المشروع
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar size="md" fallback={project.ownerDisplayName.slice(0, 1)} />
              <div>
                <p className="font-semibold text-foreground">
                  {project.ownerDisplayName}
                </p>
                <p dir="ltr" className="text-end font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
                  @{project.ownerUsername}
                </p>
              </div>
            </div>
          </section>

          {project.fitHint !== null && (
            <section className="h-fit rounded-card border border-primary/40 bg-primary/5 p-5">
              <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
                توافقك مع المشروع
              </h2>
              <p className={cn("mt-2 flex items-center gap-1.5 font-bold", FIT_META[project.fitHint.bucket].className)}>
                {project.fitHint.bucket === "strong" && <BadgeCheck className="size-4" />}
                {FIT_META[project.fitHint.bucket].label}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {project.fitHint.reason}
              </p>
              <p className="mt-3 border-t border-primary/20 pt-2.5 text-[11px] leading-5 text-muted-foreground">
                مبني على مهاراتك الموثقة فقط — الأهلية تُفحص لكل مهمة عند
                التقديم.
              </p>
            </section>
          )}
        </aside>
      </div>

      {project.openTasks.length > 0 && !project.archived && (
        <div className="sticky bottom-16 z-10 mx-auto w-full max-w-sm md:hidden">
          <Button asChild className="w-full shadow-lg">
            <a href="#tasks">عرض المهام ({project.openTasks.length})</a>
          </Button>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, href }: { task: ProjectTaskSummaryDto; href: string }) {
  const fit = task.fitHint === null ? null : FIT_META[task.fitHint.bucket];
  return (
    <article className="rounded-input border border-border bg-background p-4 transition-colors hover:border-primary/50">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-foreground">{task.title}</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex flex-wrap gap-1.5">
          {task.requiredTechnologies.map((tech) => (
            <span key={tech} dir="ltr" className="font-mono text-[11px] tracking-[0.65px]">
              {tech}
            </span>
          ))}
        </span>
        {task.deadlineLabel && <span>الموعد: {task.deadlineLabel}</span>}
        {task.rewardLabel && (
          <span dir="ltr" className="font-mono text-[11px] tracking-[0.65px] text-foreground">
            {task.rewardLabel}
          </span>
        )}
      </div>
      {task.fitHint !== null && fit !== null && (
        <p className={cn("mt-2 text-xs font-medium", fit.className)}>
          {fit.label}
          {task.fitHint.requiredCount > 0 && (
            <span dir="ltr" className="ms-1.5 font-mono text-[10px] font-normal tracking-[0.65px] text-muted-foreground">
              {task.fitHint.matchedCount}/{task.fitHint.requiredCount}
            </span>
          )}
          <span className="ms-1.5 font-normal text-muted-foreground">
            — {task.fitHint.reason}
          </span>
        </p>
      )}
      <div className="mt-3">
        <Button asChild size="sm" variant="outline">
          <a href={href}>عرض المهمة</a>
        </Button>
      </div>
    </article>
  );
}
