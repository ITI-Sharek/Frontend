import { BadgeCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import type { FitBucket, TaskCardDto } from "../types/task.types";

const DIFFICULTY_LABELS: Record<TaskCardDto["difficulty"], string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export const FIT_META: Record<FitBucket, { label: string; className: string }> = {
  strong: { label: "توافق قوي", className: "text-primary" },
  partial: { label: "توافق جزئي", className: "text-amber-600 dark:text-amber-400" },
  low: { label: "توافق منخفض", className: "text-muted-foreground" },
  unknown: { label: "التوافق غير معروف", className: "text-muted-foreground" },
};

/** WF task card: title → project → tech/difficulty → deadline/reward → fit. */
export function TaskCard({ task }: { task: TaskCardDto }) {
  const fit = task.fitHint === null ? null : FIT_META[task.fitHint.bucket];
  return (
    <article className="flex flex-col rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-foreground">{task.title}</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </div>
      <p dir="ltr" className="mt-1 text-end font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
        {task.projectName}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {task.requiredTechnologies.map((tech) => (
          <span
            key={tech}
            dir="ltr"
            className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {task.deadlineLabel && <span>الموعد: {task.deadlineLabel}</span>}
        {task.rewardLabel && (
          <span dir="ltr" className="font-mono text-[11px] tracking-[0.65px] text-foreground">
            {task.rewardLabel}
          </span>
        )}
        <span>{task.applicantsLabel}</span>
      </div>
      {task.fitHint !== null && fit !== null && (
        <div className="mt-3 border-t border-border pt-2.5">
          <p className={cn("flex items-center gap-1.5 text-sm font-bold", fit.className)}>
            {task.fitHint.bucket === "strong" && <BadgeCheck className="size-4" />}
            {fit.label}
            {task.fitHint.requiredCount > 0 && (
              <span dir="ltr" className="font-mono text-[11px] font-normal tracking-[0.65px] text-muted-foreground">
                {task.fitHint.matchedCount}/{task.fitHint.requiredCount}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {task.fitHint.reason}
          </p>
        </div>
      )}
      <div className="mt-4">
        <Button asChild size="sm" className="w-full">
          <a href={`/tasks/${task.id}`}>عرض المهمة</a>
        </Button>
      </div>
    </article>
  );
}
