import { Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

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
  const openerRef = useRef<HTMLElement | null>(null);
  const fieldId = useId();

  if (isOpen && openerRef.current === null && typeof document !== "undefined") {
    openerRef.current = document.activeElement as HTMLElement | null;
  }

  useEffect(
    () => () => {
      const opener = openerRef.current;
      if (opener?.isConnected) opener.focus();
    },
    [],
  );

  async function submit() {
    const normalized = reason.trim();
    if (
      field &&
      (normalized.length < field.minLength ||
        normalized.length > field.maxLength)
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
          if (!field) return;
          event.preventDefault();
          document.getElementById(fieldId)?.focus();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2">{description}</DialogDescription>

        {field && (
          <div className="mt-5">
            <Label htmlFor={fieldId}>{field.label}</Label>
            <Textarea
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
              className="mt-1.5"
            />
            <div
              id={`${fieldId}-help`}
              className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground"
            >
              <span>{field.help}</span>
              <span>
                {reason.length}/{field.maxLength}
              </span>
            </div>
            {fieldError && (
              <p
                id={`${fieldId}-error`}
                role="alert"
                className="mt-2 text-sm text-destructive"
              >
                {fieldError}
              </p>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-4 text-sm text-destructive"
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
            variant={destructive ? "destructive" : "primary"}
            disabled={isSubmitting}
            onClick={() => void submit()}
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
