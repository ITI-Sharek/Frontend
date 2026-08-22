import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAssignmentCall } from "@/providers/assignment-call-provider";
import { Button } from "@/shared/components/ui/button";

import { CallUnavailableNotice } from "./call-unavailable-notice";

export interface CallLaunchButtonProps {
  conversationId: string;
  calleeId: string;
  calleeName: string;
  /** e.g. the conversation is read-only. */
  disabled?: boolean;
}

/**
 * The one piece of `assignment-calls` UI composed directly into the
 * Assignment Conversation thread's header. `assignment-conversations` never
 * imports this module directly (module isolation, CLAUDE.md) -- the ROUTE
 * composes both and passes the resulting element down as a prop instead.
 */
export function CallLaunchButton({
  conversationId,
  calleeId,
  calleeName,
  disabled = false,
}: CallLaunchButtonProps) {
  const { t } = useTranslation();
  const { capabilities, isBusy, startCall } = useAssignmentCall();

  if (!capabilities.canCall) {
    return <CallUnavailableNotice capabilities={capabilities} />;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || isBusy}
      onClick={() => startCall({ conversationId, calleeId, calleeName })}
      aria-label={t("assignmentCalls.launch.startAria", { name: calleeName })}
    >
      <Phone className="size-4" aria-hidden="true" />
      {t("assignmentCalls.launch.start")}
    </Button>
  );
}
