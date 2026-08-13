import { Flag, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

import type {
  DecisionFeedbackReportReason,
  OwnerDecisionDto,
} from "../types/application.types";

export function ReportDecisionFeedbackDialog({
  decision,
  isOpen,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}: {
  decision: OwnerDecisionDto;
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (
    reason: DecisionFeedbackReportReason,
    description: string,
  ) => Promise<void>;
}) {
  const { t } = useTranslation();
  const reasonValues: DecisionFeedbackReportReason[] = [
    "harassment", "misuse", "fraud", "reputation_manipulation", "inaccurate_ai", "other",
  ];
  const reasons = reasonValues.map((value) => ({
    value,
    label: t(`contributionRequests.reportDialog.reasons.${value}`),
  }));
  const [reason, setReason] =
    useState<DecisionFeedbackReportReason>("harassment");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const selectId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(selectId)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onCancel();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "select:not([disabled]), textarea:not([disabled]), button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onCancel, selectId]);

  if (!isOpen) return null;

  async function submit() {
    const normalized = description.trim();
    if (normalized.length < 10) {
      setFieldError(t("contributionRequests.reportDialog.descriptionError"));
      document.getElementById(descriptionId)?.focus();
      return;
    }
    setFieldError(null);
    await onConfirm(reason, normalized);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`report-decision-title-${decision.id}`}
        aria-describedby={`report-decision-description-${decision.id}`}
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/40 text-foreground">
            <Flag className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id={`report-decision-title-${decision.id}`}
              className="text-lg font-bold text-foreground"
            >
              {t("contributionRequests.reportDialog.title")}
            </h2>
            <p
              id={`report-decision-description-${decision.id}`}
              className="mt-1 text-sm leading-6 text-muted-foreground"
            >
              {t("contributionRequests.reportDialog.description")}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor={selectId}>{t("contributionRequests.reportDialog.reason")}</Label>
            <select
              id={selectId}
              value={reason}
              disabled={isSubmitting}
              onChange={(event) =>
                setReason(event.target.value as DecisionFeedbackReportReason)
              }
              className="mt-1.5 h-[50px] w-full rounded-input border border-border bg-input-bg px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              {reasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor={descriptionId}>{t("contributionRequests.reportDialog.details")}</Label>
            <textarea
              id={descriptionId}
              value={description}
              rows={5}
              minLength={10}
              maxLength={2000}
              disabled={isSubmitting}
              aria-invalid={fieldError !== null}
              aria-describedby={
                fieldError
                  ? `report-description-error-${decision.id}`
                  : `report-description-help-${decision.id}`
              }
              onChange={(event) => {
                setDescription(event.target.value);
                if (fieldError) setFieldError(null);
              }}
              className="mt-1.5 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <div className="mt-1 flex items-start justify-between gap-3 text-xs">
              <p
                id={`report-description-help-${decision.id}`}
                className="text-muted-foreground"
              >
                {t("contributionRequests.reportDialog.help")}
              </p>
              <span className="shrink-0 text-muted-foreground">
                {description.length}/2000
              </span>
            </div>
            {fieldError && (
              <p
                id={`report-description-error-${decision.id}`}
                role="alert"
                className="mt-2 text-sm text-destructive"
              >
                {fieldError}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-4 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => void submit()}
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("contributionRequests.reportDialog.confirm")}
          </Button>
        </div>
      </section>
    </div>
  );
}
