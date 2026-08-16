import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
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
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDiscarding) onCancel();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (isDiscarding) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isDiscarding) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("discard-request-cancel")?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <DialogTitle>
              {t("contributionRequests.discardDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.discardDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5">
          <Label htmlFor="discard-reason">
            {t("contributionRequests.cancelDialog.reason")}
          </Label>
          <Textarea
            id="discard-reason"
            value={reason}
            maxLength={500}
            rows={3}
            disabled={isDiscarding}
            aria-invalid={reason.trim().length === 1}
            aria-describedby={
              reason.trim().length === 1 ? "discard-reason-error" : undefined
            }
            onChange={(event) => setReason(event.target.value)}
            className="mt-1.5 min-h-0"
          />
          {reason.trim().length === 1 && (
            <p
              id="discard-reason-error"
              role="alert"
              className="mt-1 text-xs text-destructive"
            >
              {t("contributionRequests.cancelDialog.reasonError")}
            </p>
          )}
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

        <DialogFooter className="mt-5 flex-row justify-end">
          <Button
            id="discard-request-cancel"
            type="button"
            variant="outline"
            disabled={isDiscarding}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={
              isDiscarding ||
              (reason.trim().length > 0 && reason.trim().length < 2)
            }
            onClick={() => void onConfirm(reason.trim())}
          >
            {isDiscarding && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("contributionRequests.discardDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
