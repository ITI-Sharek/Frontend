import { Mic, MicOff, PhoneOff, ScreenShare, ScreenShareOff, Video, VideoOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

export interface CallControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  canScreenShare: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onHangUp: () => void;
}

export function CallControls({
  audioEnabled,
  videoEnabled,
  screenShareEnabled,
  canScreenShare,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onHangUp,
}: CallControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant={audioEnabled ? "outline" : "destructive"}
        size="icon"
        aria-pressed={audioEnabled}
        aria-label={
          audioEnabled
            ? t("assignmentCalls.controls.muteAria")
            : t("assignmentCalls.controls.unmuteAria")
        }
        onClick={onToggleAudio}
      >
        {audioEnabled ? (
          <Mic className="size-4" aria-hidden="true" />
        ) : (
          <MicOff className="size-4" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant={videoEnabled ? "outline" : "subtle"}
        size="icon"
        aria-pressed={videoEnabled}
        aria-label={
          videoEnabled
            ? t("assignmentCalls.controls.cameraOffAria")
            : t("assignmentCalls.controls.cameraOnAria")
        }
        onClick={onToggleVideo}
      >
        {videoEnabled ? (
          <Video className="size-4" aria-hidden="true" />
        ) : (
          <VideoOff className="size-4" aria-hidden="true" />
        )}
      </Button>
      {canScreenShare && (
        <Button
          type="button"
          variant={screenShareEnabled ? "evidence" : "outline"}
          size="icon"
          aria-pressed={screenShareEnabled}
          aria-label={
            screenShareEnabled
              ? t("assignmentCalls.controls.stopScreenShareAria")
              : t("assignmentCalls.controls.startScreenShareAria")
          }
          onClick={onToggleScreenShare}
        >
          {screenShareEnabled ? (
            <ScreenShareOff className="size-4" aria-hidden="true" />
          ) : (
            <ScreenShare className="size-4" aria-hidden="true" />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        aria-label={t("assignmentCalls.controls.hangUpAria")}
        onClick={onHangUp}
      >
        <PhoneOff className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
