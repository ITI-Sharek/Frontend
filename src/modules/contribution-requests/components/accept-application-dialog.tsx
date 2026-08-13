import { CircleCheck, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import type { ApplicationDto } from "../types/application.types";

export function AcceptApplicationDialog({
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
  onConfirm: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLElement>(null);
  const cancelId = `accept-application-cancel-${application.id}`;

  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(cancelId)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onCancel();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
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
  }, [cancelId, isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

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
        aria-labelledby={`accept-application-title-${application.id}`}
        aria-describedby={`accept-application-description-${application.id}`}
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-evidence-teal/10 text-evidence-teal">
            <CircleCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id={`accept-application-title-${application.id}`}
              className="text-lg font-bold text-foreground"
            >
              {t("contributionRequests.acceptDialog.title", { name: application.contributor.displayName })}
            </h2>
            <p
              id={`accept-application-description-${application.id}`}
              className="mt-1 text-sm leading-6 text-muted-foreground"
            >
              {t("contributionRequests.acceptDialog.description")}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-input bg-border/25 p-4 text-sm leading-6 text-foreground">
          <p className="font-semibold">{t("contributionRequests.acceptDialog.duration")}</p>
          <p className="mt-1 text-muted-foreground">
            {application.proposedDeliveryDurationDays === null
              ? t("contributionRequests.unspecified")
              : t("contributionRequests.days", { count: application.proposedDeliveryDurationDays })}
          </p>
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
            {t("contributionRequests.acceptDialog.reviewAgain")}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("contributionRequests.acceptDialog.confirm")}
          </Button>
        </div>
      </section>
    </div>
  );
}
