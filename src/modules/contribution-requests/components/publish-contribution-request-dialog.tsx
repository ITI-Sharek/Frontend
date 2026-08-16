import { Loader2, Radio } from "lucide-react";
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPublishing) onCancel();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (isPublishing) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isPublishing) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("publish-request-confirm")?.focus();
        }}
      >
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 text-brand-indigo">
            <Radio className="size-5" aria-hidden="true" />
          </span>
          <div>
            <DialogTitle>
              {t("contributionRequests.publishDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("contributionRequests.publishDialog.description")}
            </DialogDescription>
          </div>
        </DialogHeader>

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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
