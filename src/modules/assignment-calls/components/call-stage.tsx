import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { CallControlsProps } from "./call-controls";
import { CallControls } from "./call-controls";

export interface CallStageProps {
  peerName: string;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isReconnecting: boolean;
  degradedReason: "audio_only" | "listen_only" | null;
  controls: CallControlsProps;
}

/** The active-call video/audio surface: remote + local video, degraded-mode badge. */
export function CallStage({
  peerName,
  remoteStream,
  localStream,
  isReconnecting,
  degradedReason,
  controls,
}: CallStageProps) {
  const { t } = useTranslation();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  return (
    <section
      aria-label={t("assignmentCalls.stage.ariaLabel", { name: peerName })}
      className="flex flex-col gap-4 rounded-card border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{peerName}</h2>
        {isReconnecting && (
          <span
            role="status"
            className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive"
          >
            {t("assignmentCalls.stage.reconnecting")}
          </span>
        )}
        {!isReconnecting && degradedReason && (
          <span
            role="status"
            className="rounded-full bg-surface-fog px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
          >
            {t(`assignmentCalls.stage.degraded.${degradedReason}`)}
          </span>
        )}
      </div>

      <div className="relative aspect-video overflow-hidden rounded-input bg-surface-fog">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="size-full object-cover"
          aria-label={t("assignmentCalls.stage.remoteVideoAria", { name: peerName })}
        />
        <div className="absolute bottom-3 end-3 h-24 w-32 overflow-hidden rounded-input border border-border bg-card shadow-md">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="size-full object-cover"
            aria-label={t("assignmentCalls.stage.localVideoAria")}
          />
        </div>
      </div>

      <CallControls {...controls} />
    </section>
  );
}
