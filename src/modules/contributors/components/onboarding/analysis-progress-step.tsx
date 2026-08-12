import { Check, Circle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import type { AnalysisStageDto } from "../../types/onboarding.types";

/**
 * CJ-1 step 2: staged analysis progress (DEC-015 4-state fallback) — never a
 * blank spinner. Mock: stages advance on a timer so the demo shows movement.
 */
export function AnalysisProgressStep({
  stages: initialStages,
  failed = false,
  onCompleted,
  onRetry,
}: {
  stages: AnalysisStageDto[];
  failed?: boolean;
  onCompleted: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const [stages, setStages] = useState(initialStages);
  const doneCount = stages.filter((stage) => stage.status === "done").length;
  const allDone = doneCount === stages.length;

  useEffect(() => {
    if (failed || allDone) return;
    const timer = setTimeout(() => {
      setStages((current) => {
        const runningIndex = current.findIndex((s) => s.status === "running");
        if (runningIndex === -1) return current;
        return current.map((stage, index) => {
          if (index === runningIndex) return { ...stage, status: "done" as const };
          if (index === runningIndex + 1)
            return { ...stage, status: "running" as const };
          return stage;
        });
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [stages, failed, allDone]);

  if (failed) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-foreground">
          {t("contributor.onboarding.analysisFailedTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("contributor.onboarding.analysisFailedDescription")}
        </p>
        <Button size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" />
          {t("contributor.onboarding.analysisRetry")}
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">
          {t("contributor.onboarding.analysisRunningTitle")}
        </h2>
        <StatusChip tone="ai" icon={Loader2}>
          {t("contributor.onboarding.analysisStageCount", {
            done: doneCount,
            total: stages.length,
          })}
        </StatusChip>
      </div>

      <ol className="mt-5 flex flex-col gap-3">
        {stages.map((stage) => (
          <li key={stage.id} className="flex items-center gap-3">
            {stage.status === "done" ? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-4" />
              </span>
            ) : stage.status === "running" ? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Loader2 className="size-4 animate-spin" />
              </span>
            ) : (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                <Circle className="size-2.5" />
              </span>
            )}
            <span
              className={
                stage.status === "todo"
                  ? "text-sm text-muted-foreground"
                  : "text-sm font-medium text-foreground"
              }
            >
              {stage.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {t("contributor.onboarding.analysisLeaveAndNotify")}
        </p>
        <Button size="sm" disabled={!allDone} onClick={onCompleted}>
          {t("contributor.onboarding.analysisViewGenerated")}
        </Button>
      </div>
    </Card>
  );
}
