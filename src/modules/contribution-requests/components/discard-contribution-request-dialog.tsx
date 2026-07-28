import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

export function DiscardContributionRequestDialog({
  isOpen,
  isDiscarding,
  error,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isDiscarding: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    document.getElementById("discard-request-cancel")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDiscarding) onCancel();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), textarea:not([disabled])",
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
  }, [isDiscarding, isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDiscarding) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-request-title"
        aria-describedby="discard-request-description"
        className="w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="discard-request-title" className="text-lg font-bold text-foreground">
              تجاهل هذه المسودة؟
            </h2>
            <p id="discard-request-description" className="mt-1 text-sm leading-6 text-muted-foreground">
              هذا إجراء نهائي، لكنه لا يحذف السجل. ستبقى المسودة محفوظة للعرض فقط.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor="discard-reason">السبب (اختياري)</Label>
          <textarea
            id="discard-reason"
            value={reason}
            maxLength={500}
            rows={3}
            disabled={isDiscarding}
            aria-invalid={reason.trim().length === 1}
            aria-describedby={reason.trim().length === 1 ? "discard-reason-error" : undefined}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1.5 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          {reason.trim().length === 1 && (
            <p id="discard-reason-error" role="alert" className="mt-1 text-xs text-destructive">
              اكتب حرفين على الأقل أو اترك السبب فارغًا.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="mt-3 text-sm leading-6 text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button
            id="discard-request-cancel"
            type="button"
            variant="outline"
            disabled={isDiscarding}
            onClick={onCancel}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDiscarding || (reason.trim().length > 0 && reason.trim().length < 2)}
            onClick={() => void onConfirm(reason.trim())}
          >
            {isDiscarding && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            تجاهل المسودة
          </Button>
        </div>
      </section>
    </div>
  );
}
