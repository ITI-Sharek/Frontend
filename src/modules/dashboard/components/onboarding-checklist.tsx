import { Check, Circle, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { OnboardingStepDto } from "../types/dashboard.types";

/**
 * WF-02 State B: onboarding incomplete — the dashboard *is* the checklist.
 * Explore stays open meanwhile; applying unlocks after review.
 */
export function OnboardingChecklist({ steps }: { steps: OnboardingStepDto[] }) {
  const doneCount = steps.filter((step) => step.status === "done").length;

  return (
    <section className="overflow-hidden rounded-card border border-border bg-card">
      <div className="border-b border-border bg-surface-fog p-5 sm:p-6">
        <p className="text-xs font-semibold text-primary">تفعيل حسابك</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          أكمل الإعداد ({doneCount} من {steps.length})
        </h2>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-border"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-primary"
            style={{
              width: `${(doneCount / Math.max(steps.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <ol className="flex flex-col divide-y divide-border px-5 sm:px-6">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3 py-4">
            <StepMarker status={step.status} />
            <div>
              <p
                className={
                  step.status === "todo"
                    ? "text-muted-foreground"
                    : "font-medium text-foreground"
                }
              >
                {step.label}
              </p>
              {step.hint && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-fog px-5 py-4 sm:px-6">
        <span className="text-sm text-muted-foreground">في هذه الأثناء:</span>
        <Button size="sm" variant="outline">
          استكشاف المشاريع
        </Button>
        <span className="text-xs text-muted-foreground">
          (التقديم يُفتح بعد مراجعة ملفك المهاري)
        </span>
      </div>
    </section>
  );
}

function StepMarker({ status }: { status: OnboardingStepDto["status"] }) {
  if (status === "done") {
    return (
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }
  return (
    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
      <Circle className="size-2.5" />
    </span>
  );
}
