import { Loader2, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

export function PublishContributionRequestDialog({
  isOpen,
  isPublishing,
  error,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isPublishing: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    document.getElementById("publish-request-confirm")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPublishing) onCancel();
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
  }, [isPublishing, isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPublishing) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-request-title"
        aria-describedby="publish-request-description"
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 text-brand-indigo">
            <Radio className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="publish-request-title"
              className="text-lg font-bold text-foreground"
            >
              {t("contributionRequests.publishDialog.title")}
            </h2>
            <p
              id="publish-request-description"
              className="mt-1 text-sm leading-6 text-muted-foreground"
            >
              {t("contributionRequests.publishDialog.description")}
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-3 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPublishing}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            id="publish-request-confirm"
            type="button"
            disabled={isPublishing}
            onClick={() => void onConfirm()}
          >
            {isPublishing && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("contributionRequests.publishDialog.confirm")}
          </Button>
        </div>
      </section>
    </div>
  );
}
