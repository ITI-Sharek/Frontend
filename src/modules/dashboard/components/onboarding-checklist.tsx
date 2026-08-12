import { Check, Circle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import type { OnboardingStepDto } from "../types/dashboard.types";

export function OnboardingChecklist({
  steps,
}: {
  steps: OnboardingStepDto[];
}) {
  const { t } = useTranslation();
  const doneCount = steps.filter((step) => step.status === "done").length;

  return (
    <section className="rounded-card border border-border bg-card p-6">
      <h2 className="text-lg font-bold text-foreground">
        {t("dashboard.onboarding.title", { done: doneCount, total: steps.length })}
      </h2>

      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3">
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

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          {t("dashboard.onboarding.meanwhile")}
        </span>
        <Button size="sm" variant="outline">
          {t("dashboard.onboarding.exploreProjects")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("dashboard.onboarding.applyUnlockNote")}
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
