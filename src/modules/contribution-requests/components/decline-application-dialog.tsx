import { Loader2, MessageSquareText } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

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
  const dialogRef = useRef<HTMLElement>(null);
  const feedbackId = useId();
  const cancelId = `decline-application-cancel-${application.id}`;

  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(feedbackId)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onCancel();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "textarea:not([disabled]), button:not([disabled])",
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
  }, [feedbackId, isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

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
        aria-labelledby={`decline-application-title-${application.id}`}
        aria-describedby={`decline-application-description-${application.id}`}
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/40 text-foreground">
            <MessageSquareText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id={`decline-application-title-${application.id}`}
              className="text-lg font-bold text-foreground"
            >
              {t("contributionRequests.declineDialog.title")}
            </h2>
            <p
              id={`decline-application-description-${application.id}`}
              className="mt-1 text-sm leading-6 text-muted-foreground"
            >
              {t("contributionRequests.declineDialog.description")}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor={feedbackId}>{t("contributionRequests.declineDialog.feedback")}</Label>
          <textarea
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
            className="mt-1.5 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
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

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            id={cancelId}
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
        </div>
      </section>
    </div>
  );
}
