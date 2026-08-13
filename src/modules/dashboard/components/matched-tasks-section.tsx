import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
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
  const { t } = useTranslation();
  return (
    <section
      id="matches"
      className="scroll-mt-28"
      aria-labelledby="matched-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-evidence-teal-foreground dark:text-evidence-teal">
            {t("dashboard.matches.eyebrow")}
          </p>
          <h2
            id="matched-heading"
            className="mt-1 text-xl font-bold text-foreground"
          >
            {t("dashboard.matches.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.matches.reason", { reason: matchReason })}
          </p>
        </div>
        <Link
          to={ROUTES.tasks}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-input px-2 text-sm font-semibold text-primary hover:bg-primary/[0.06]"
        >
          {t("dashboard.matches.viewAll")}
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {tasks.map((task) => {
          const fullMatch = task.matchedCount === task.requiredCount;
          return (
            <Link
              key={task.id}
              to={ROUTES.task(task.id)}
              className="group flex min-w-0 flex-col rounded-card border border-border bg-card p-5 transition-[border-color,background-color] hover:border-primary/40 hover:bg-primary/[0.018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.65px]",
                  fullMatch
                    ? "border-evidence-teal/50 bg-evidence-teal/10 text-evidence-teal"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {fullMatch && <BadgeCheck className="size-3.5" />}
                {t("dashboard.matches.fit", { matched: task.matchedCount, required: task.requiredCount })}
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
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {t("dashboard.matches.review")}
                <ArrowLeft
                  className="size-4 transition-transform group-hover:-translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
