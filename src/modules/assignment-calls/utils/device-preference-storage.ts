import { DEVICE_PREFERENCE_STORAGE_KEY } from "../constants/call-config";

/**
 * Persists only the user's chosen device ids -- NEVER whether the camera or
 * microphone were on. Camera/mic default OFF on every mount, no exceptions
 * (product rule); the preview only remembers WHICH device to preselect once
 * the user turns one on.
 */
export interface DevicePreference {
  audioDeviceId: string | null;
  videoDeviceId: string | null;
}

const EMPTY_PREFERENCE: DevicePreference = { audioDeviceId: null, videoDeviceId: null };

function isDevicePreference(value: unknown): value is DevicePreference {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.audioDeviceId === null || typeof record.audioDeviceId === "string") &&
    (record.videoDeviceId === null || typeof record.videoDeviceId === "string")
  );
}

export function readDevicePreference(): DevicePreference {
  if (typeof window === "undefined") return EMPTY_PREFERENCE;
  try {
    const raw = window.localStorage.getItem(DEVICE_PREFERENCE_STORAGE_KEY);
    if (!raw) return EMPTY_PREFERENCE;
    const parsed: unknown = JSON.parse(raw);
    return isDevicePreference(parsed) ? parsed : EMPTY_PREFERENCE;
  } catch {
    return EMPTY_PREFERENCE;
  }
}

export function writeDevicePreference(preference: DevicePreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DEVICE_PREFERENCE_STORAGE_KEY,
      JSON.stringify(preference),
    );
  } catch {
    // Best-effort only -- a private window or a full storage quota should
    // never block device selection.
  }
}
