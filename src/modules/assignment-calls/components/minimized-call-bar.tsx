import { Link } from "@tanstack/react-router";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

export interface MinimizedCallBarProps {
  peerName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
  /** The Assignment conversation this call was launched from. */
  conversationId: string;
}

/**
 * `end-4` (not `right-4`) so RTL auto-mirrors. "Return" is a plain router
 * `Link` -- it only navigates, it must never touch the `RTCPeerConnection`,
 * which is exactly why it isn't a button with an `onClick` handler here.
 */
export function MinimizedCallBar({
  peerName,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onHangUp,
  conversationId,
}: MinimizedCallBarProps) {
  const { t } = useTranslation();

  return (
    <div
      role="region"
      aria-label={t("assignmentCalls.minimizedBar.ariaLabel", { name: peerName })}
      className="fixed bottom-4 end-4 z-50 flex items-center gap-2 rounded-card border border-border bg-card p-2.5 shadow-xl"
    >
      <span className="max-w-32 truncate px-1 text-xs font-semibold text-foreground">
        {peerName}
      </span>
      <Button
        type="button"
        variant={audioEnabled ? "outline" : "destructive"}
        size="icon-sm"
        aria-pressed={audioEnabled}
        aria-label={
          audioEnabled
            ? t("assignmentCalls.controls.muteAria")
            : t("assignmentCalls.controls.unmuteAria")
        }
        onClick={onToggleAudio}
      >
        {audioEnabled ? (
          <Mic className="size-3.5" aria-hidden="true" />
        ) : (
          <MicOff className="size-3.5" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant={videoEnabled ? "outline" : "subtle"}
        size="icon-sm"
        aria-pressed={videoEnabled}
        aria-label={
          videoEnabled
            ? t("assignmentCalls.controls.cameraOffAria")
            : t("assignmentCalls.controls.cameraOnAria")
        }
        onClick={onToggleVideo}
      >
        {videoEnabled ? (
          <Video className="size-3.5" aria-hidden="true" />
        ) : (
          <VideoOff className="size-3.5" aria-hidden="true" />
        )}
      </Button>
      <Button asChild type="button" variant="subtle" size="sm">
        <Link to={ROUTES.messages} search={{ conversation: conversationId }}>
          {t("assignmentCalls.minimizedBar.return")}
        </Link>
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        aria-label={t("assignmentCalls.controls.hangUpAria")}
        onClick={onHangUp}
      >
        <PhoneOff className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
