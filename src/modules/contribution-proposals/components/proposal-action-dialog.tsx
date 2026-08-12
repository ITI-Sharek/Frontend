import { Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

export function ProposalActionDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  field,
  isSubmitting,
  error,
  destructive = false,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  field?: { label: string; help: string; minLength: number; maxLength: number };
  isSubmitting: boolean;
  error: string | null;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const fieldId = useId();

  // Moving focus and restoring it belongs in its own effect. The keydown
  // effect below depends on `isSubmitting` and `onCancel`, and at the call site
  // `onCancel` is a fresh arrow and `field` a fresh object on every parent
  // render — so a combined effect re-ran constantly and re-fired focus(),
  // yanking the caret out of the textarea mid-submit.
  const hasField = field !== undefined;
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusTarget = hasField
      ? document.getElementById(fieldId)
      : dialogRef.current?.querySelector<HTMLElement>("button");
    focusTarget?.focus();

    // The dialog is conditionally mounted, so it closes by unmounting rather
    // than by isOpen flipping — cleanup is the only place restore can happen.
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [fieldId, hasField, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  async function submit() {
    const normalized = reason.trim();
    if (
      field &&
      (normalized.length < field.minLength || normalized.length > field.maxLength)
    ) {
      setFieldError(
        t("proposalAction.lengthError", {
          min: field.minLength,
          max: field.maxLength,
        }),
      );
      document.getElementById(fieldId)?.focus();
      return;
    }
    setFieldError(null);
    await onConfirm(normalized);
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-bold text-foreground">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {field && (
          <div className="mt-5">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <textarea
              id={fieldId}
              value={reason}
              rows={5}
              minLength={field.minLength}
              maxLength={field.maxLength}
              disabled={isSubmitting}
              aria-invalid={fieldError !== null}
              aria-describedby={`${fieldId}-help${fieldError ? ` ${fieldId}-error` : ""}`}
              onChange={(event) => {
                setReason(event.target.value);
                if (fieldError) setFieldError(null);
              }}
              className="mt-1.5 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <div id={`${fieldId}-help`} className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{field.help}</span>
              <span>{reason.length}/{field.maxLength}</span>
            </div>
            {fieldError && <p id={`${fieldId}-error`} role="alert" className="mt-2 text-sm text-destructive">{fieldError}</p>}
          </div>
        )}

        {error && <p role="alert" aria-live="assertive" className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "primary"}
            disabled={isSubmitting}
            onClick={() => void submit()}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
