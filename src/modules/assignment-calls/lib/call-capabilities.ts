/**
 * Feature detection only -- NEVER user-agent sniffing. `getDisplayMedia` is
 * `undefined` on iOS Safari and most mobile browsers; screen share must hide
 * behind an explicit "not available on this device" message rather than a
 * button that silently fails.
 */
export interface AssignmentCallCapabilities {
  hasPeerConnection: boolean;
  hasGetUserMedia: boolean;
  hasGetDisplayMedia: boolean;
  isSecureContext: boolean;
  /** True only when everything required to place or answer a call is present. */
  canCall: boolean;
}

export function getAssignmentCallCapabilities(): AssignmentCallCapabilities {
  const hasPeerConnection = typeof RTCPeerConnection !== "undefined";
  const mediaDevices =
    typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  const hasGetUserMedia = typeof mediaDevices?.getUserMedia === "function";
  const hasGetDisplayMedia = typeof mediaDevices?.getDisplayMedia === "function";
  const isSecureContext =
    typeof window !== "undefined" ? window.isSecureContext === true : false;

  return {
    hasPeerConnection,
    hasGetUserMedia,
    hasGetDisplayMedia,
    isSecureContext,
    canCall: hasPeerConnection && hasGetUserMedia && isSecureContext,
  };
}
