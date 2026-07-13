import { BadgeCheck, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

import type { MatchedTaskDto } from "../types/dashboard.types";

/**
 * WF-02 "MATCHED TASKS": section title carries the *why* (verified skills);
 * every card shows its fit count. Horizontal scroll on mobile.
 */
export function MatchedTasksSection({
  tasks,
  matchReason,
}: {
  tasks: MatchedTaskDto[];
  matchReason: string;
}) {
  return (
    <section aria-labelledby="matched-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="matched-heading"
          className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground"
        >
          مهام مطابقة لك
          <span className="ms-2 font-sans text-xs normal-case tracking-normal">
            (السبب: {matchReason})
          </span>
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:opacity-80"
        >
          عرض الكل
          <ChevronLeft className="size-4" />
        </a>
      </div>

      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
        {tasks.map((task) => {
          const fullMatch = task.matchedCount === task.requiredCount;
          return (
            <article
              key={task.id}
              className="min-w-[240px] snap-start rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/50 md:min-w-0"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.65px]",
                  fullMatch
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {fullMatch && <BadgeCheck className="size-3.5" />}
                توافق {task.matchedCount}/{task.requiredCount}
              </span>
              <h3 className="mt-3 font-semibold text-foreground">
                {task.title}
              </h3>
              <p
                dir="ltr"
                className="mt-1 text-end font-mono text-[12px] tracking-[0.65px] text-muted-foreground"
              >
                {task.projectName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {task.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    dir="ltr"
                    className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
