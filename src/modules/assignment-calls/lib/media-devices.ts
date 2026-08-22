/**
 * `getUserMedia` is always called once per kind (audio, video), never as one
 * combined `{ audio: true, video: true }` request -- a combined request
 * fails wholesale if only the camera is blocked at the OS level, so audio
 * and video are requested independently and either can succeed on its own.
 */
export type MediaAcquisitionErrorReason =
  | "blocked"
  | "not_found"
  | "in_use"
  | "unknown";

export interface MediaKindResult {
  stream: MediaStream | null;
  track: MediaStreamTrack | null;
  errorReason: MediaAcquisitionErrorReason | null;
}

export interface AcquireLocalMediaOptions {
  wantAudio: boolean;
  wantVideo: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}

export interface AcquireLocalMediaResult {
  audio: MediaKindResult;
  video: MediaKindResult;
}

const EMPTY_RESULT: MediaKindResult = { stream: null, track: null, errorReason: null };

export function mapGetUserMediaError(error: unknown): MediaAcquisitionErrorReason {
  const name = error instanceof Error ? error.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "blocked";
    case "NotFoundError":
    case "OverconstrainedError":
      return "not_found";
    case "NotReadableError":
    case "TrackStartError":
      return "in_use";
    default:
      return "unknown";
  }
}

async function acquireKind(
  kind: "audio" | "video",
  deviceId: string | undefined,
): Promise<MediaKindResult> {
  const constraint: MediaTrackConstraints | true = deviceId
    ? { deviceId: { exact: deviceId } }
    : true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      kind === "audio" ? { audio: constraint } : { video: constraint },
    );
    const track =
      kind === "audio" ? stream.getAudioTracks().at(0) : stream.getVideoTracks().at(0);
    return { stream, track: track ?? null, errorReason: null };
  } catch (error) {
    return { stream: null, track: null, errorReason: mapGetUserMediaError(error) };
  }
}

/**
 * Requests audio and video as two independent `getUserMedia` calls in
 * parallel. Either can fail without the other being affected -- a blocked
 * camera still yields a usable audio-only (or, if both are declined,
 * listen-only) join rather than throwing and blocking the call entirely.
 */
export async function acquireLocalMedia(
  options: AcquireLocalMediaOptions,
): Promise<AcquireLocalMediaResult> {
  const [audio, video] = await Promise.all([
    options.wantAudio
      ? acquireKind("audio", options.audioDeviceId)
      : Promise.resolve(EMPTY_RESULT),
    options.wantVideo
      ? acquireKind("video", options.videoDeviceId)
      : Promise.resolve(EMPTY_RESULT),
  ]);
  return { audio, video };
}

export function stopMediaKindResult(result: MediaKindResult): void {
  result.track?.stop();
}

export function stopLocalMedia(result: AcquireLocalMediaResult): void {
  stopMediaKindResult(result.audio);
  stopMediaKindResult(result.video);
}

export interface EnumeratedDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

/**
 * Labels are empty strings until a permission grant reveals them -- the
 * device-preview UI shows "Allow access to see device names" whenever a
 * returned label is blank.
 */
export async function listMediaDevices(): Promise<EnumeratedDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === "audioinput" || device.kind === "videoinput")
    .map((device) => ({
      deviceId: device.deviceId,
      label: device.label,
      kind: device.kind,
    }));
}
