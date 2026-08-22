import { VideoOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AssignmentCallCapabilities } from "../lib/call-capabilities";

export interface CallUnavailableNoticeProps {
  capabilities: AssignmentCallCapabilities;
}

function unavailableReasonKey(capabilities: AssignmentCallCapabilities): string {
  if (!capabilities.isSecureContext) return "assignmentCalls.unavailable.insecureContext";
  if (!capabilities.hasPeerConnection) return "assignmentCalls.unavailable.noWebrtc";
  if (!capabilities.hasGetUserMedia) return "assignmentCalls.unavailable.noMediaDevices";
  return "assignmentCalls.unavailable.generic";
}

/**
 * Rendered instead of a call affordance when `call-capabilities` says this
 * device/browser cannot place or answer a call -- a stated reason, never a
 * silently-broken button.
 */
export function CallUnavailableNotice({ capabilities }: CallUnavailableNoticeProps) {
  const { t } = useTranslation();

  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-input bg-surface-fog px-3 py-2 text-xs text-muted-foreground"
    >
      <VideoOff className="size-4 shrink-0" aria-hidden="true" />
      {t(unavailableReasonKey(capabilities))}
    </p>
  );
}
