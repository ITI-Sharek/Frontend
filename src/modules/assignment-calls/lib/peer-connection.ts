import type { IceServerDto } from "../types/assignment-call.types";

export type AssignmentCallPeerRole = "caller" | "callee";
export type MediaKind = "audio" | "video";

export interface AssignmentCallPeerCallbacks {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onLocalOffer: (sdp: string, opts: { iceRestart: boolean; isInitial: boolean }) => void;
  onLocalAnswer: (sdp: string, opts: { isInitial: boolean }) => void;
  onRemoteStream: (stream: MediaStream | null) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  /** The local grace window elapsed with no recovery -- ICE is now failed. */
  onIceFailed: () => void;
}

export interface CreatePeerConnectionOptions {
  role: AssignmentCallPeerRole;
  iceServers: IceServerDto[];
  callbacks: AssignmentCallPeerCallbacks;
  /** Default 3000ms (product spec); overridable so tests don't need real timers. */
  iceDisconnectGraceMs?: number;
}

export interface AssignmentCallPeerConnection {
  addLocalTrack: (track: MediaStreamTrack, stream: MediaStream) => RTCRtpSender;
  addRecvOnlyTransceiver: (kind: MediaKind) => void;
  /**
   * Swaps a track into an existing same-kind SENDING sender in place --
   * `RTCRtpSender.replaceTrack`, which never fires `negotiationneeded`.
   * Returns `false` when no such sender exists yet (e.g. no local camera
   * track was ever added), so the caller can fall back to `addLocalTrack`,
   * which uses `addTrack` and DOES renegotiate.
   */
  replaceTrackForKind: (kind: MediaKind, track: MediaStreamTrack | null) => Promise<boolean>;
  applyRemoteOffer: (sdp: string) => Promise<void>;
  applyRemoteAnswer: (sdp: string) => Promise<void>;
  addRemoteIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  /** Called by the provider once `/reconnect` returns fresh TURN credentials. */
  restartIceWithFreshServers: (iceServers: IceServerDto[]) => void;
  getIceConnectionState: () => RTCIceConnectionState;
  teardown: () => void;
}

const DEFAULT_ICE_DISCONNECT_GRACE_MS = 3_000;

function toRTCIceServers(iceServers: IceServerDto[]): RTCIceServer[] {
  return iceServers.map((server) => ({
    urls: server.urls,
    ...(server.username !== undefined ? { username: server.username } : {}),
    ...(server.credential !== undefined ? { credential: server.credential } : {}),
  }));
}

/**
 * Wraps `RTCPeerConnection` lifecycle, implementing the standard "perfect
 * negotiation" pattern: the callee is always polite, the caller is always
 * impolite. On an offer collision the polite side rolls back its own
 * pending local offer (an implicit effect of `setRemoteDescription` with an
 * incoming offer while not stable) and accepts the remote offer; the
 * impolite side ignores the incoming offer and lets its own offer win.
 * See https://w3c.github.io/webrtc-pc and the widely cited MDN/webrtc.org
 * "Perfect negotiation" article -- this is that exact pattern, not a
 * bespoke variant.
 */
export function createAssignmentCallPeerConnection(
  options: CreatePeerConnectionOptions,
): AssignmentCallPeerConnection {
  const { role, callbacks } = options;
  const polite = role === "callee";
  const graceMs = options.iceDisconnectGraceMs ?? DEFAULT_ICE_DISCONNECT_GRACE_MS;

  const pc = new RTCPeerConnection({ iceServers: toRTCIceServers(options.iceServers) });

  let makingOffer = false;
  let ignoreOffer = false;
  let pendingIceRestart = false;
  let offerCount = 0;
  let answerCount = 0;
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function clearDisconnectTimer(): void {
    if (disconnectTimer === null) return;
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }

  function handleIceFailure(): void {
    clearDisconnectTimer();
    pendingIceRestart = true;
    pc.restartIce();
    callbacks.onIceFailed();
  }

  pc.onnegotiationneeded = () => {
    void (async () => {
      try {
        makingOffer = true;
        const iceRestart = pendingIceRestart;
        pendingIceRestart = false;
        await pc.setLocalDescription();
        const sdp = pc.localDescription?.sdp ?? "";
        offerCount += 1;
        callbacks.onLocalOffer(sdp, { iceRestart, isInitial: offerCount === 1 });
      } catch {
        // A transient negotiation failure surfaces through ICE connection
        // state instead of being rethrown here -- `onnegotiationneeded` has
        // no caller to propagate a rejection to.
      } finally {
        makingOffer = false;
      }
    })();
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) callbacks.onIceCandidate(event.candidate.toJSON());
  };

  pc.ontrack = (event) => {
    callbacks.onRemoteStream(event.streams[0] ?? null);
  };

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    callbacks.onIceConnectionStateChange?.(state);

    if (state === "failed") {
      handleIceFailure();
      return;
    }
    if (state === "disconnected") {
      if (disconnectTimer !== null) return;
      disconnectTimer = setTimeout(() => {
        disconnectTimer = null;
        const current = pc.iceConnectionState;
        if (current === "disconnected" || current === "failed") handleIceFailure();
      }, graceMs);
      return;
    }
    if (state === "connected" || state === "completed") {
      clearDisconnectTimer();
    }
  };

  function addLocalTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender {
    return pc.addTrack(track, stream);
  }

  function addRecvOnlyTransceiver(kind: MediaKind): void {
    pc.addTransceiver(kind, { direction: "recvonly" });
  }

  async function replaceTrackForKind(
    kind: MediaKind,
    track: MediaStreamTrack | null,
  ): Promise<boolean> {
    const sender = pc.getSenders().find((s) => s.track?.kind === kind);
    if (!sender) return false;
    await sender.replaceTrack(track);
    return true;
  }

  async function applyRemoteOffer(sdp: string): Promise<void> {
    const offerCollision = makingOffer || pc.signalingState !== "stable";
    ignoreOffer = !polite && offerCollision;
    if (ignoreOffer) return;

    // Setting a remote offer while a local offer is pending performs an
    // implicit rollback of the local offer per the WebRTC spec -- no
    // explicit `setLocalDescription({ type: "rollback" })` call needed.
    await pc.setRemoteDescription({ type: "offer", sdp });
    await pc.setLocalDescription();
    const answerSdp = pc.localDescription?.sdp ?? "";
    answerCount += 1;
    callbacks.onLocalAnswer(answerSdp, { isInitial: answerCount === 1 });
  }

  async function applyRemoteAnswer(sdp: string): Promise<void> {
    await pc.setRemoteDescription({ type: "answer", sdp });
  }

  async function addRemoteIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      // Candidates that arrive for an offer we deliberately ignored (the
      // impolite side, mid-collision) are expected to fail -- swallow only
      // that case, per the perfect-negotiation pattern.
      if (!ignoreOffer) throw error;
    }
  }

  function restartIceWithFreshServers(iceServers: IceServerDto[]): void {
    pc.setConfiguration({ iceServers: toRTCIceServers(iceServers) });
    pendingIceRestart = true;
    pc.restartIce();
  }

  function getIceConnectionState(): RTCIceConnectionState {
    return pc.iceConnectionState;
  }

  function teardown(): void {
    clearDisconnectTimer();
    for (const sender of pc.getSenders()) {
      sender.track?.stop();
    }
    pc.close();
  }

  return {
    addLocalTrack,
    addRecvOnlyTransceiver,
    replaceTrackForKind,
    applyRemoteOffer,
    applyRemoteAnswer,
    addRemoteIceCandidate,
    restartIceWithFreshServers,
    getIceConnectionState,
    teardown,
  };
}
