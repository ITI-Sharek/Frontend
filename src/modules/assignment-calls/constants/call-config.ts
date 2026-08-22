/** Local grace window before a "disconnected" ICE state is treated as failed. */
export const ICE_DISCONNECT_GRACE_MS = 3_000;

/** How long `signaling-channel.ts` waits for a signal's ack before rejecting. */
export const SIGNAL_ACK_TIMEOUT_MS = 8_000;

/** `localStorage` key for the user's last-chosen device ids (never on/off state). */
export const DEVICE_PREFERENCE_STORAGE_KEY = "assignment-calls:device-preference";
