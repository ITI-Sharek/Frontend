import { Flag, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";

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
    "harassment",
    "misuse",
    "fraud",
    "reputation_manipulation",
    "inaccurate_ai",
    "other",
  ];
  const reasons = reasonValues.map((value) => ({
    value,
    label: t(`contributionRequests.reportDialog.reasons.${value}`),
  }));
  const [reason, setReason] =
    useState<DecisionFeedbackReportReason>("harassment");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const selectId = useId();
  const descriptionId = useId();

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onCancel();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(selectId)?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("decision-feedback-report-trigger")?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/40 text-foreground">
            <Flag className="size-5" aria-hidden="true" />
          </span>
          <div>
            <DialogTitle>
              {t("contributionRequests.reportDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.reportDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor={selectId}>
              {t("contributionRequests.reportDialog.reason")}
            </Label>
            <NativeSelect
              id={selectId}
              value={reason}
              disabled={isSubmitting}
              onChange={(event) =>
                setReason(event.target.value as DecisionFeedbackReportReason)
              }
              className="mt-1.5"
            >
              {reasons.map((item) => (
                <NativeSelectOption key={item.value} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label htmlFor={descriptionId}>
              {t("contributionRequests.reportDialog.details")}
            </Label>
            <Textarea
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
              className="mt-1.5"
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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
