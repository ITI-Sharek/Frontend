import { CircleCheck, Loader2 } from "lucide-react";
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
  const cancelId = `accept-application-cancel-${application.id}`;

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
          document.getElementById(cancelId)?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-evidence-teal/10 text-evidence-teal">
            <CircleCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <DialogTitle>
              {t("contributionRequests.acceptDialog.title", {
                name: application.contributor.displayName,
              })}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.acceptDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-5 rounded-input bg-border/25 p-4 text-sm leading-6 text-foreground">
          <p className="font-semibold">
            {t("contributionRequests.acceptDialog.duration")}
          </p>
          <p className="mt-1 text-muted-foreground">
            {application.proposedDeliveryDurationDays === null
              ? t("contributionRequests.unspecified")
              : t("contributionRequests.days", {
                  count: application.proposedDeliveryDurationDays,
                })}
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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
