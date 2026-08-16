import { Loader2, MessageSquareText } from "lucide-react";
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
import { Textarea } from "@/shared/components/ui/textarea";

import type { ApplicationDto } from "../types/application.types";

export function DeclineApplicationDialog({
  application,
  isOpen,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}: {
  application: ApplicationDto;
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (feedback: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const feedbackId = useId();

  async function submit() {
    const normalized = feedback.trim();
    if (normalized.length === 0) {
      setFieldError(t("contributionRequests.declineDialog.feedbackRequired"));
      document.getElementById(feedbackId)?.focus();
      return;
    }
    setFieldError(null);
    await onConfirm(normalized);
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
          document.getElementById(feedbackId)?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/40 text-foreground">
            <MessageSquareText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <DialogTitle>
              {t("contributionRequests.declineDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.declineDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5">
          <Label htmlFor={feedbackId}>
            {t("contributionRequests.declineDialog.feedback")}
          </Label>
          <Textarea
            id={feedbackId}
            value={feedback}
            rows={5}
            maxLength={2000}
            disabled={isSubmitting}
            aria-invalid={fieldError !== null}
            aria-describedby={
              fieldError
                ? `decline-feedback-error-${application.id}`
                : `decline-feedback-help-${application.id}`
            }
            onChange={(event) => {
              setFeedback(event.target.value);
              if (fieldError) setFieldError(null);
            }}
            className="mt-1.5"
          />
          <div className="mt-1 flex items-start justify-between gap-3 text-xs">
            <p
              id={`decline-feedback-help-${application.id}`}
              className="text-muted-foreground"
            >
              {t("contributionRequests.declineDialog.help")}
            </p>
            <span className="shrink-0 text-muted-foreground">
              {feedback.length}/2000
            </span>
          </div>
          {fieldError && (
            <p
              id={`decline-feedback-error-${application.id}`}
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {fieldError}
            </p>
          )}
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
            {t("contributionRequests.declineDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
