import { BadgeCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/shared/components/layout/page-layout";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";

import type { MatchedTaskDto } from "../types/dashboard.types";

/**
 * The fit gauge.
 *
 * "3/3 fit" as a piece of text tells you nothing until you have read both
 * numbers and done the division. A row of pips — one per skill the request
 * asks for, filled where the contributor has *verified* that skill — is
 * legible before it is read, and it makes an incomplete match visibly
 * incomplete rather than merely a smaller number.
 *
 * The fraction stays in the accessible name so screen readers get the precise
 * value rather than a count of decorative dots.
 */
function FitGauge({
  matched,
  required,
  label,
}: {
  matched: number;
  required: number;
  label: string;
}) {
  const full = matched >= required && required > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border py-1 pe-2.5 ps-2",
        full
          ? "border-evidence-teal/35 bg-evidence-soft text-evidence-soft-foreground"
          : "border-border-strong bg-surface-fog text-muted-foreground",
      )}
      title={label}
    >
      <span className="flex items-center gap-[3px]" aria-hidden>
        {Array.from({ length: required }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "block h-2.5 w-[5px] rounded-[1.5px]",
              index < matched
                ? full
                  ? "bg-evidence-teal"
                  : "bg-primary"
                : "bg-border-strong",
            )}
          />
        ))}
      </span>
      <span className="tnum text-[11px] font-bold leading-none">{label}</span>
      {full ? <BadgeCheck className="size-3.5 shrink-0" aria-hidden /> : null}
    </span>
  );
}

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
      <SectionHeading
        eyebrow={t("dashboard.matches.eyebrow")}
        title={
          <span id="matched-heading">{t("dashboard.matches.title")}</span>
        }
        description={t("dashboard.matches.reason", { reason: matchReason })}
        action={
          <Link
            to={ROUTES.tasks}
            className="group/all inline-flex min-h-10 items-center gap-1.5 rounded-input px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            {t("dashboard.matches.viewAll")}
            <DirectionalArrow className="size-4 transition-transform duration-200 ease-out group-hover/all:translate-x-0.5 rtl:group-hover/all:-translate-x-0.5" />
          </Link>
        }
      />

      <div className="grid gap-3.5 lg:grid-cols-3">
        {tasks.map((task, index) => (
          <Link
            key={task.id}
            to={ROUTES.task(task.id)}
            data-card-hover
            style={{ animationDelay: `${Math.min(index, 4) * 55}ms` }}
            className={cn(
              "sk-rise group flex min-w-0 flex-col rounded-card border border-border bg-card p-5",
              "shadow-[var(--shadow-record)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <FitGauge
              matched={task.matchedCount}
              required={task.requiredCount}
              label={t("dashboard.matches.fit", {
                matched: task.matchedCount,
                required: task.requiredCount,
              })}
            />

            <h3 className="bidi mt-3.5 text-pretty font-bold leading-snug text-foreground">
              {task.title}
            </h3>

            {/*
             * The project is an identifier, not prose — mono is doing real
             * work here rather than dressing the card up as "technical".
             */}
            <p
              dir="ltr"
              className="mt-1.5 truncate font-mono text-[11.5px] text-subtle-foreground"
            >
              {task.projectName}
            </p>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {task.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  dir="ltr"
                  className="rounded-social border border-border bg-surface-fog px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>

            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
              {t("dashboard.matches.review")}
              <DirectionalArrow className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
