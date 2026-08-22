import { Camera, CameraOff, Loader2, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";

import type { AcquireLocalMediaResult, MediaKindResult } from "../lib/media-devices";
import {
  acquireLocalMedia,
  listMediaDevices,
  stopMediaKindResult,
} from "../lib/media-devices";
import {
  readDevicePreference,
  writeDevicePreference,
} from "../utils/device-preference-storage";

const EMPTY_RESULT: MediaKindResult = { stream: null, track: null, errorReason: null };

export interface CallDevicePreviewProps {
  peerName: string;
  variant: "outgoing" | "incoming";
  pending?: boolean;
  onConfirm: (result: AcquireLocalMediaResult) => void;
  onCancel: () => void;
}

/**
 * Camera and microphone default OFF on every single mount, no exceptions --
 * `useState(false)` initializers make this a structural guarantee rather
 * than something callers have to remember to preserve. Only the chosen
 * device id is ever persisted across sessions (`device-preference-storage`);
 * on/off is intentionally never remembered.
 */
export function CallDevicePreview({
  peerName,
  variant,
  pending = false,
  onConfirm,
  onCancel,
}: CallDevicePreviewProps) {
  const { t } = useTranslation();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioResult, setAudioResult] = useState<MediaKindResult>(EMPTY_RESULT);
  const [videoResult, setVideoResult] = useState<MediaKindResult>(EMPTY_RESULT);
  const [devices, setDevices] = useState<
    { deviceId: string; label: string; kind: MediaDeviceKind }[]
  >([]);
  const [preference, setPreference] = useState(() => readDevicePreference());
  const [busyKind, setBusyKind] = useState<"audio" | "video" | null>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const confirmedRef = useRef(false);

  useEffect(() => {
    listMediaDevices().then(setDevices).catch(() => setDevices([]));
  }, []);

  useEffect(() => {
    // Stop any acquired preview tracks on unmount unless they were just
    // handed off to `onConfirm` -- confirmed tracks become the caller's
    // responsibility to stop (they get attached to the peer connection).
    return () => {
      if (confirmedRef.current) return;
      stopMediaKindResult(audioResult);
      stopMediaKindResult(videoResult);
    };
  }, []);

  useEffect(() => {
    const element = videoElementRef.current;
    if (!element) return;
    element.srcObject = videoResult.stream;
  }, [videoResult.stream]);

  const hasDeviceLabels = devices.some((device) => device.label.length > 0);
  const audioDevices = devices.filter((device) => device.kind === "audioinput");
  const videoDevices = devices.filter((device) => device.kind === "videoinput");

  async function toggleAudio() {
    if (audioEnabled) {
      stopMediaKindResult(audioResult);
      setAudioResult(EMPTY_RESULT);
      setAudioEnabled(false);
      return;
    }
    setBusyKind("audio");
    const result = await acquireLocalMedia({
      wantAudio: true,
      wantVideo: false,
      audioDeviceId: preference.audioDeviceId ?? undefined,
    });
    setBusyKind(null);
    setAudioResult(result.audio);
    setAudioEnabled(result.audio.track !== null);
    if (result.audio.track) {
      listMediaDevices().then(setDevices).catch(() => undefined);
    }
  }

  async function toggleVideo() {
    if (videoEnabled) {
      stopMediaKindResult(videoResult);
      setVideoResult(EMPTY_RESULT);
      setVideoEnabled(false);
      return;
    }
    setBusyKind("video");
    const result = await acquireLocalMedia({
      wantAudio: false,
      wantVideo: true,
      videoDeviceId: preference.videoDeviceId ?? undefined,
    });
    setBusyKind(null);
    setVideoResult(result.video);
    setVideoEnabled(result.video.track !== null);
    if (result.video.track) {
      listMediaDevices().then(setDevices).catch(() => undefined);
    }
  }

  function handleAudioDeviceChange(deviceId: string) {
    const next = { ...preference, audioDeviceId: deviceId };
    setPreference(next);
    writeDevicePreference(next);
  }

  function handleVideoDeviceChange(deviceId: string) {
    const next = { ...preference, videoDeviceId: deviceId };
    setPreference(next);
    writeDevicePreference(next);
  }

  function handleConfirm() {
    confirmedRef.current = true;
    onConfirm({ audio: audioResult, video: videoResult });
  }

  function handleCancel() {
    stopMediaKindResult(audioResult);
    stopMediaKindResult(videoResult);
    setAudioResult(EMPTY_RESULT);
    setVideoResult(EMPTY_RESULT);
    setAudioEnabled(false);
    setVideoEnabled(false);
    onCancel();
  }

  return (
    <section
      aria-label={t("assignmentCalls.preview.ariaLabel")}
      className="flex flex-col gap-4 rounded-card border border-border bg-card p-5"
    >
      <div>
        <h2 className="text-base font-bold text-foreground">
          {variant === "outgoing"
            ? t("assignmentCalls.preview.outgoingTitle", { name: peerName })
            : t("assignmentCalls.preview.incomingTitle", { name: peerName })}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("assignmentCalls.preview.devicesOffByDefault")}
        </p>
      </div>

      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-input bg-surface-fog">
        {videoEnabled && videoResult.stream ? (
          <video
            ref={videoElementRef}
            autoPlay
            muted
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <CameraOff
            className="size-8 text-muted-foreground"
            aria-hidden="true"
            data-testid="camera-off-placeholder"
          />
        )}
      </div>

      {!hasDeviceLabels && (
        <p className="text-xs text-muted-foreground">
          {t("assignmentCalls.preview.allowToSeeNames")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={audioEnabled ? "evidence" : "outline"}
          size="sm"
          onClick={() => void toggleAudio()}
          disabled={busyKind === "audio"}
          aria-pressed={audioEnabled}
        >
          {busyKind === "audio" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : audioEnabled ? (
            <Mic className="size-4" aria-hidden="true" />
          ) : (
            <MicOff className="size-4" aria-hidden="true" />
          )}
          {audioEnabled
            ? t("assignmentCalls.preview.micOn")
            : t("assignmentCalls.preview.micOff")}
        </Button>
        <Button
          type="button"
          variant={videoEnabled ? "evidence" : "outline"}
          size="sm"
          onClick={() => void toggleVideo()}
          disabled={busyKind === "video"}
          aria-pressed={videoEnabled}
        >
          {busyKind === "video" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : videoEnabled ? (
            <Camera className="size-4" aria-hidden="true" />
          ) : (
            <CameraOff className="size-4" aria-hidden="true" />
          )}
          {videoEnabled
            ? t("assignmentCalls.preview.cameraOn")
            : t("assignmentCalls.preview.cameraOff")}
        </Button>
      </div>

      {(audioResult.errorReason ?? videoResult.errorReason) && (
        <p role="alert" className="text-xs text-destructive">
          {t(`assignmentCalls.preview.deviceErrors.${audioResult.errorReason ?? videoResult.errorReason}`)}
        </p>
      )}

      {audioDevices.length > 1 && (
        <label className="text-xs text-muted-foreground">
          {t("assignmentCalls.preview.microphoneLabel")}
          <NativeSelect
            className="mt-1"
            value={preference.audioDeviceId ?? ""}
            onChange={(event) => handleAudioDeviceChange(event.target.value)}
          >
            {audioDevices.map((device) => (
              <NativeSelectOption key={device.deviceId} value={device.deviceId}>
                {device.label || t("assignmentCalls.preview.unknownDevice")}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      )}
      {videoDevices.length > 1 && (
        <label className="text-xs text-muted-foreground">
          {t("assignmentCalls.preview.cameraLabel")}
          <NativeSelect
            className="mt-1"
            value={preference.videoDeviceId ?? ""}
            onChange={(event) => handleVideoDeviceChange(event.target.value)}
          >
            {videoDevices.map((device) => (
              <NativeSelectOption key={device.deviceId} value={device.deviceId}>
                {device.label || t("assignmentCalls.preview.unknownDevice")}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={pending}>
          {t("common.cancel")}
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {variant === "outgoing"
            ? t("assignmentCalls.preview.startCall")
            : t("assignmentCalls.preview.joinCall")}
        </Button>
      </div>
    </section>
  );
}
