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

export function CancelContributionRequestDialog({
  isOpen,
  isCancelling,
  error,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isCancelling: boolean;
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
        if (!open && !isCancelling) onCancel();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (isCancelling) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isCancelling) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("cancel-request-cancel")?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <DialogTitle>
              {t("contributionRequests.cancelDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.cancelDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5">
          <Label htmlFor="cancel-reason">
            {t("contributionRequests.cancelDialog.reason")}
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            maxLength={500}
            rows={3}
            disabled={isCancelling}
            aria-invalid={reason.trim().length === 1}
            aria-describedby={
              reason.trim().length === 1 ? "cancel-reason-error" : undefined
            }
            onChange={(event) => setReason(event.target.value)}
            className="mt-1.5 min-h-0"
          />
          {reason.trim().length === 1 && (
            <p
              id="cancel-reason-error"
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
            id="cancel-request-cancel"
            type="button"
            variant="outline"
            disabled={isCancelling}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={
              isCancelling ||
              (reason.trim().length > 0 && reason.trim().length < 2)
            }
            onClick={() => void onConfirm(reason.trim())}
          >
            {isCancelling && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("contributionRequests.cancelDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
