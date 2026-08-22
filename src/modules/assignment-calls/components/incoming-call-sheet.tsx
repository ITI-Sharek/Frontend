import { Loader2, Phone, PhoneOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export interface IncomingCallSheetProps {
  callerName: string;
  pending?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  /**
   * Set when `call-capabilities` says this browser/device cannot join a
   * call at all -- replaces Accept with the stated reason instead of
   * offering a button that would silently fail.
   */
  unavailableReason?: string;
}

/**
 * `role="alertdialog"` (not the default "dialog") -- this interrupts the
 * user the way a native incoming-call UI does. Radix `Dialog` already
 * focus-traps and is keyboard reachable; only the ARIA role is overridden.
 * Escape / overlay-dismiss is treated the same as pressing Decline rather
 * than silently closing with no server-side effect.
 *
 * The parent only ever renders this component while the call machine is in
 * `incoming_ringing` -- the instant a durable `assignment_call.answered` or
 * `assignment_call.ended` names this call (even from another of the user's
 * own tabs), the machine leaves that status and this sheet unmounts on its
 * own, with no dismiss logic needed here.
 */
export function IncomingCallSheet({
  callerName,
  pending = false,
  onAccept,
  onDecline,
  unavailableReason,
}: IncomingCallSheetProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onDecline();
      }}
    >
      <DialogContent
        role="alertdialog"
        aria-label={t("assignmentCalls.incoming.ariaLabel")}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          onDecline();
        }}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle>{t("assignmentCalls.incoming.title", { name: callerName })}</DialogTitle>
        <DialogDescription>{t("assignmentCalls.incoming.description")}</DialogDescription>
        {unavailableReason && (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {unavailableReason}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={onDecline}
            disabled={pending}
            aria-label={t("assignmentCalls.incoming.declineAria")}
          >
            <PhoneOff className="size-4" aria-hidden="true" />
            {t("assignmentCalls.incoming.decline")}
          </Button>
          {!unavailableReason && (
            <Button
              type="button"
              variant="evidence"
              onClick={onAccept}
              disabled={pending}
              aria-label={t("assignmentCalls.incoming.acceptAria")}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Phone className="size-4" aria-hidden="true" />
              )}
              {t("assignmentCalls.incoming.accept")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
