import { useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

import { API_BASE_URL } from "@/config/env";
import { ROUTES } from "@/config/routes.config";
import { useRealtimeSocket } from "@/lib/socket/realtime-socket-context";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";
import { useCurrentUserQuery } from "@/modules/auth";
import { accessTokenStore } from "@/services/storage.service";
import {
  CallDevicePreview,
  CallStage,
  CallUnavailableNotice,
  IncomingCallSheet,
  INITIAL_CALL_MACHINE_STATE,
  MinimizedCallBar,
  acquireLocalMedia,
  callStateMachineReducer,
  createAssignmentCallPeerConnection,
  createSignalingChannel,
  getAssignmentCallCapabilities,
  getAssignmentCallErrorMessage,
  isAssignmentCallEvent,
  stopLocalMedia,
  useAnswerAssignmentCallMutation,
  useDeclineAssignmentCallMutation,
  useEndAssignmentCallMutation,
  useReconnectAssignmentCallMutation,
  useStartAssignmentCallMutation,
} from "@/modules/assignment-calls";
import type {
  AcquireLocalMediaResult,
  AssignmentCallCapabilities,
  AssignmentCallEventType,
  AssignmentCallPeerConnection,
  AssignmentCallSignalInbound,
  CallMachineState,
  SignalingChannel,
} from "@/modules/assignment-calls";

const EMPTY_MEDIA_RESULT: AcquireLocalMediaResult = {
  audio: { stream: null, track: null, errorReason: null },
  video: { stream: null, track: null, errorReason: null },
};

const DURABLE_EVENT_TYPES: AssignmentCallEventType[] = [
  "assignment_call.ringing",
  "assignment_call.answered",
  "assignment_call.declined",
  "assignment_call.ended",
];

export interface AssignmentCallContextValue {
  machine: CallMachineState;
  capabilities: AssignmentCallCapabilities;
  /** True whenever a call attempt already occupies this tab (start is disabled). */
  isBusy: boolean;
  startCall: (input: { conversationId: string; calleeId: string; calleeName: string }) => void;
}

const AssignmentCallContext = createContext<AssignmentCallContextValue | null>(null);

export function useAssignmentCall(): AssignmentCallContextValue {
  const value = useContext(AssignmentCallContext);
  if (!value) {
    throw new Error("useAssignmentCall must be used inside AssignmentCallProvider");
  }
  return value;
}

function newIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

function createLocalMediaStream(): MediaStream | null {
  return typeof MediaStream === "undefined" ? null : new MediaStream();
}

export function AssignmentCallProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { socket } = useRealtimeSocket();
  const currentUserQuery = useCurrentUserQuery();
  const currentUserId = currentUserQuery.data?.id;
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const [machine, dispatch] = useReducer(
    callStateMachineReducer,
    INITIAL_CALL_MACHINE_STATE,
  );
  const machineRef = useRef(machine);
  machineRef.current = machine;

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  const capabilities = useMemo(() => getAssignmentCallCapabilities(), []);
  const recentEventIdsRef = useRef(new RecentEventIds());
  const mediaRef = useRef<AcquireLocalMediaResult>(EMPTY_MEDIA_RESULT);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<AssignmentCallPeerConnection | null>(null);
  const signalingChannelRef = useRef<SignalingChannel | null>(null);
  const signalChainRef = useRef<Promise<void>>(Promise.resolve());

  const startMutation = useStartAssignmentCallMutation();
  const answerMutation = useAnswerAssignmentCallMutation();
  const declineMutation = useDeclineAssignmentCallMutation();
  const endMutation = useEndAssignmentCallMutation();
  const reconnectMutation = useReconnectAssignmentCallMutation();

  useEffect(() => {
    // `MediaStream` is a browser-only API. TanStack Start renders this
    // provider on the server too, so the stream must not be constructed
    // during render.
    localStreamRef.current = createLocalMediaStream();
  }, []);

  // ---- Teardown ---------------------------------------------------------

  const teardownCallResources = useCallback(() => {
    peerConnectionRef.current?.teardown();
    peerConnectionRef.current = null;
    signalingChannelRef.current?.dispose();
    signalingChannelRef.current = null;
    signalChainRef.current = Promise.resolve();

    // Removed by reference rather than via `MediaStream.getTracks()` -- this
    // module already knows exactly which tracks it added (`mediaRef`), so it
    // doesn't need to round-trip through the stream to find them again.
    const localStream = localStreamRef.current;
    if (localStream) {
      if (mediaRef.current.audio.track) {
        localStream.removeTrack(mediaRef.current.audio.track);
      }
      if (mediaRef.current.video.track) {
        localStream.removeTrack(mediaRef.current.video.track);
      }
    }
    stopLocalMedia(mediaRef.current);
    mediaRef.current = EMPTY_MEDIA_RESULT;
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;

    setRemoteStream(null);
    setAudioEnabled(false);
    setVideoEnabled(false);
    setScreenShareEnabled(false);
  }, []);

  const prevStatusRef = useRef(machine.status);
  useEffect(() => {
    const becameTerminal =
      (machine.status === "ended" || machine.status === "idle") &&
      prevStatusRef.current !== "ended" &&
      prevStatusRef.current !== "idle";
    if (becameTerminal) teardownCallResources();
    prevStatusRef.current = machine.status;
  }, [machine.status, teardownCallResources]);

  // ---- Durable events (ringing / answered / declined / ended) -----------

  useEffect(() => {
    if (!socket || !currentUserId) return;

    function handle(expectedType: AssignmentCallEventType) {
      return (raw: unknown) => {
        if (!isAssignmentCallEvent(raw) || raw.type !== expectedType) return;
        if (recentEventIdsRef.current.hasOrAdd(raw.eventId)) return;

        const call = raw.payload.call;
        const current = machineRef.current;

        if (expectedType === "assignment_call.ringing") {
          if (call.calleeId === currentUserId && current.status === "idle") {
            dispatch({ type: "INCOMING_CALL", call });
          }
          return;
        }
        if (expectedType === "assignment_call.answered") {
          if (current.context.callId === call.callId) {
            dispatch({ type: "DURABLE_ANSWERED", call });
          }
          return;
        }
        // declined and ended are both terminal from the state machine's
        // point of view -- see call-state-machine.ts's DURABLE_ENDED.
        if (current.context.callId === call.callId) {
          dispatch({ type: "DURABLE_ENDED", call });
        }
      };
    }

    const handlers = DURABLE_EVENT_TYPES.map(
      (type) => [type, handle(type)] as const,
    );
    for (const [type, handler] of handlers) socket.on(type, handler);
    return () => {
      for (const [type, handler] of handlers) socket.off(type, handler);
    };
  }, [socket, currentUserId]);

  // ---- Peer connection + signaling, created once "connecting" is reached

  useEffect(() => {
    if (machine.status !== "connecting") return;
    if (peerConnectionRef.current) return;
    if (!socket) return;
    const { callId, callSessionId, joinCredentials, role } = machine.context;
    if (!callId || !callSessionId || !joinCredentials || !role) return;

    const channel = createSignalingChannel(socket, { callId, callSessionId });
    const pc = createAssignmentCallPeerConnection({
      role,
      iceServers: joinCredentials.iceServers,
      callbacks: {
        onIceCandidate: (candidate) => {
          // `RTCIceCandidateInit.candidate` is typed optional (empty string
          // signals end-of-candidates in the raw Web API); the wire DTO
          // requires it, so default to "" rather than widening the DTO.
          void channel
            .emitSignal({
              kind: "ice_candidate",
              candidate: {
                candidate: candidate.candidate ?? "",
                sdpMid: candidate.sdpMid ?? null,
                sdpMLineIndex: candidate.sdpMLineIndex ?? null,
                ...(candidate.usernameFragment != null
                  ? { usernameFragment: candidate.usernameFragment }
                  : {}),
              },
            })
            .catch(() => undefined);
        },
        onLocalOffer: (sdp, opts) => {
          void channel
            .emitSignal({
              kind: opts.isInitial ? "offer" : "renegotiate_offer",
              sdp,
            })
            .catch(() => undefined);
        },
        onLocalAnswer: (sdp, opts) => {
          void channel
            .emitSignal({
              kind: opts.isInitial ? "answer" : "renegotiate_answer",
              sdp,
            })
            .catch(() => undefined);
        },
        onRemoteStream: (stream) => setRemoteStream(stream),
        onIceConnectionStateChange: (state) => {
          if (state === "connected" || state === "completed") {
            const status = machineRef.current.status;
            if (status === "connecting") dispatch({ type: "PEER_CONNECTED" });
            else if (status === "reconnecting") dispatch({ type: "RECONNECTED" });
            return;
          }
          if (state === "disconnected") dispatch({ type: "ICE_DISCONNECTED" });
        },
        onIceFailed: () => {
          const statusBeforeFailure = machineRef.current.status;
          dispatch({ type: "ICE_FAILED" });
          if (statusBeforeFailure !== "active" && statusBeforeFailure !== "reconnecting") {
            return;
          }
          void reconnectMutation
            .mutateAsync({ callId, idempotencyKey: newIdempotencyKey() })
            .then((response) => {
              pc.restartIceWithFreshServers(response.joinCredentials.iceServers);
            })
            .catch(() => undefined);
        },
      },
    });

    const { audio, video } = mediaRef.current;
    const localStream = localStreamRef.current;
    if (audio.track && localStream) pc.addLocalTrack(audio.track, localStream);
    else pc.addRecvOnlyTransceiver("audio");
    if (video.track && localStream) pc.addLocalTrack(video.track, localStream);
    else pc.addRecvOnlyTransceiver("video");

    channel.onSignal((signal: AssignmentCallSignalInbound) => {
      signalChainRef.current = signalChainRef.current
        .then(() => applyInboundSignal(pc, signal))
        .catch(() => undefined);
    });

    peerConnectionRef.current = pc;
    signalingChannelRef.current = channel;
  }, [
    machine.status,
    machine.context.callId,
    machine.context.callSessionId,
    machine.context.joinCredentials,
    machine.context.role,
    socket,
  ]);

  // ---- beforeunload -------------------------------------------------------

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const status = machineRef.current.status;
      if (status !== "active" && status !== "reconnecting" && status !== "connecting") return;
      event.preventDefault();
      const callId = machineRef.current.context.callId;
      const token = accessTokenStore.getSnapshot();
      if (!callId || !token) return;
      // Best-effort only: `sendBeacon` cannot carry an Authorization header,
      // so a plain `fetch` with `keepalive` is used instead. The server's own
      // disconnect detection + reconnect-grace-then-end is the real
      // guarantee this call actually ends.
      void fetch(
        `${API_BASE_URL}/assignment-calls/${encodeURIComponent(callId)}/end`,
        {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ idempotencyKey: newIdempotencyKey() }),
        },
      ).catch(() => undefined);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ---- Actions ------------------------------------------------------------

  const startCall = useCallback(
    (input: { conversationId: string; calleeId: string; calleeName: string }) => {
      dispatch({ type: "START_REQUESTED", ...input });
    },
    [],
  );

  const confirmOutgoingPreview = useCallback(
    (result: AcquireLocalMediaResult) => {
      mediaRef.current = result;
      if (localStreamRef.current) {
        applyLocalTracksToStream(localStreamRef.current, result);
      }
      setAudioEnabled(result.audio.track !== null);
      setVideoEnabled(result.video.track !== null);
      dispatch({ type: "PREVIEW_CONFIRMED" });

      const conversationId = machineRef.current.context.conversationId;
      if (!conversationId) return;
      startMutation.mutate(
        { conversationId, idempotencyKey: newIdempotencyKey() },
        {
          onSuccess: (response) => {
            dispatch({
              type: "OUTGOING_RINGING",
              call: response.call,
              joinCredentials: response.joinCredentials,
              callSessionId: response.callSessionId,
            });
          },
          onError: (error) => {
            dispatch({
              type: "COMMAND_FAILED",
              error: { message: getAssignmentCallErrorMessage(t, error) },
            });
          },
        },
      );
    },
    [startMutation, t],
  );

  const confirmIncomingPreview = useCallback(
    (result: AcquireLocalMediaResult) => {
      mediaRef.current = result;
      if (localStreamRef.current) {
        applyLocalTracksToStream(localStreamRef.current, result);
      }
      setAudioEnabled(result.audio.track !== null);
      setVideoEnabled(result.video.track !== null);
      dispatch({ type: "PREVIEW_CONFIRMED" });

      const callId = machineRef.current.context.callId;
      if (!callId) return;
      answerMutation.mutate(
        { callId, idempotencyKey: newIdempotencyKey() },
        {
          onSuccess: (response) => {
            dispatch({
              type: "PEER_SESSION_READY",
              call: response.call,
              joinCredentials: response.joinCredentials,
              callSessionId: response.callSessionId,
            });
          },
          onError: (error) => {
            dispatch({
              type: "COMMAND_FAILED",
              error: { message: getAssignmentCallErrorMessage(t, error) },
            });
          },
        },
      );
    },
    [answerMutation, t],
  );

  const cancelPreview = useCallback(() => {
    const callId = machineRef.current.context.callId;
    if (callId && machineRef.current.status === "incoming_preview") {
      declineMutation.mutate({ callId, idempotencyKey: newIdempotencyKey() });
    }
    dispatch({ type: "PREVIEW_CANCELLED" });
  }, [declineMutation]);

  const acceptIncoming = useCallback(() => {
    dispatch({ type: "ACCEPT_INCOMING_CALL" });
  }, []);

  const declineIncoming = useCallback(() => {
    const callId = machineRef.current.context.callId;
    if (callId) {
      declineMutation.mutate({ callId, idempotencyKey: newIdempotencyKey() });
    }
    dispatch({ type: "DECLINE_INCOMING_CALL" });
  }, [declineMutation]);

  const hangUp = useCallback(() => {
    const callId = machineRef.current.context.callId;
    if (callId) {
      endMutation.mutate({ callId, idempotencyKey: newIdempotencyKey() });
    }
    dispatch({ type: "LOCAL_HANGUP" });
  }, [endMutation]);

  const dismissEnded = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const toggleAudio = useCallback(() => {
    const pc = peerConnectionRef.current;
    const existing = mediaRef.current.audio.track;
    if (existing) {
      existing.enabled = !existing.enabled;
      setAudioEnabled(existing.enabled);
      return;
    }
    if (!pc) return;
    const localStream = localStreamRef.current;
    if (!localStream) return;
    void acquireLocalMedia({ wantAudio: true, wantVideo: false }).then(async (result) => {
      if (!result.audio.track) return;
      mediaRef.current = { ...mediaRef.current, audio: result.audio };
      localStream.addTrack(result.audio.track);
      const replaced = await pc.replaceTrackForKind("audio", result.audio.track);
      if (!replaced) pc.addLocalTrack(result.audio.track, localStream);
      setAudioEnabled(true);
    });
  }, []);

  const toggleVideo = useCallback(() => {
    const pc = peerConnectionRef.current;
    const existing = mediaRef.current.video.track;
    if (existing) {
      existing.enabled = !existing.enabled;
      setVideoEnabled(existing.enabled);
      return;
    }
    if (!pc) return;
    const localStream = localStreamRef.current;
    if (!localStream) return;
    void acquireLocalMedia({ wantAudio: false, wantVideo: true }).then(async (result) => {
      if (!result.video.track) return;
      mediaRef.current = { ...mediaRef.current, video: result.video };
      localStream.addTrack(result.video.track);
      const replaced = await pc.replaceTrackForKind("video", result.video.track);
      if (!replaced) pc.addLocalTrack(result.video.track, localStream);
      setVideoEnabled(true);
    });
  }, []);

  const toggleScreenShare = useCallback(() => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (screenTrackRef.current) {
      const sharedTrack = screenTrackRef.current;
      screenTrackRef.current = null;
      sharedTrack.stop();
      void pc.replaceTrackForKind("video", mediaRef.current.video.track);
      setScreenShareEnabled(false);
      return;
    }

    if (!capabilities.hasGetDisplayMedia) return;
    const localStream = localStreamRef.current;
    void navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: false })
      .then(async (displayStream) => {
        const screenTrack = displayStream.getVideoTracks().at(0);
        if (!screenTrack) return;
        screenTrackRef.current = screenTrack;
        screenTrack.addEventListener("ended", () => toggleScreenShare());
        const replaced = await pc.replaceTrackForKind("video", screenTrack);
        if (!replaced && localStream) pc.addLocalTrack(screenTrack, localStream);
        setScreenShareEnabled(true);
      })
      .catch(() => undefined);
  }, [capabilities.hasGetDisplayMedia]);

  // ---- Rendering ------------------------------------------------------------

  const contextValue = useMemo<AssignmentCallContextValue>(
    () => ({
      machine,
      capabilities,
      isBusy: machine.status !== "idle" && machine.status !== "ended",
      startCall,
    }),
    [machine, capabilities, startCall],
  );

  const isMinimized = machine.status !== "idle" && pathname !== ROUTES.messages;
  const degradedReason: "audio_only" | "listen_only" | null = !audioEnabled && !videoEnabled
    ? "listen_only"
    : !videoEnabled
      ? "audio_only"
      : null;

  return (
    <AssignmentCallContext.Provider value={contextValue}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <CallOverlay
            machine={machine}
            capabilities={capabilities}
            remoteStream={remoteStream}
            localStream={localStreamRef.current}
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            screenShareEnabled={screenShareEnabled}
            isMinimized={isMinimized}
            degradedReason={degradedReason}
            pending={
              startMutation.isPending || answerMutation.isPending
            }
            onConfirmOutgoingPreview={confirmOutgoingPreview}
            onConfirmIncomingPreview={confirmIncomingPreview}
            onCancelPreview={cancelPreview}
            onAcceptIncoming={acceptIncoming}
            onDeclineIncoming={declineIncoming}
            onHangUp={hangUp}
            onDismissEnded={dismissEnded}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
          />,
          document.body,
        )}
    </AssignmentCallContext.Provider>
  );
}

function applyLocalTracksToStream(
  stream: MediaStream,
  result: AcquireLocalMediaResult,
): void {
  if (result.audio.track) stream.addTrack(result.audio.track);
  if (result.video.track) stream.addTrack(result.video.track);
}

async function applyInboundSignal(
  pc: AssignmentCallPeerConnection,
  signal: AssignmentCallSignalInbound,
): Promise<void> {
  if (signal.kind === "offer" || signal.kind === "renegotiate_offer") {
    await pc.applyRemoteOffer(signal.sdp ?? "");
  } else if (signal.kind === "answer" || signal.kind === "renegotiate_answer") {
    await pc.applyRemoteAnswer(signal.sdp ?? "");
  } else if (signal.candidate) {
    // The only remaining `AssignmentCallSignalKind` is "ice_candidate".
    await pc.addRemoteIceCandidate(signal.candidate);
  }
}

interface CallOverlayProps {
  machine: CallMachineState;
  capabilities: AssignmentCallCapabilities;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  isMinimized: boolean;
  degradedReason: "audio_only" | "listen_only" | null;
  pending: boolean;
  onConfirmOutgoingPreview: (result: AcquireLocalMediaResult) => void;
  onConfirmIncomingPreview: (result: AcquireLocalMediaResult) => void;
  onCancelPreview: () => void;
  onAcceptIncoming: () => void;
  onDeclineIncoming: () => void;
  onHangUp: () => void;
  onDismissEnded: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

function CallOverlay(props: CallOverlayProps) {
  const { t } = useTranslation();
  const { machine } = props;

  if (machine.status === "idle") return null;

  if (!props.capabilities.canCall) {
    if (machine.status === "incoming_ringing") {
      // Even an unsupported browser must still let the user decline so the
      // caller isn't left ringing forever -- Accept is replaced with the
      // stated reason instead of a button that would silently fail.
      return (
        <IncomingCallSheet
          callerName={machine.context.peerName ?? ""}
          onAccept={props.onDeclineIncoming}
          onDecline={props.onDeclineIncoming}
          unavailableReason={t("assignmentCalls.unavailable.generic")}
        />
      );
    }
    return (
      <div className="fixed bottom-4 end-4 z-50 max-w-xs">
        <CallUnavailableNotice capabilities={props.capabilities} />
      </div>
    );
  }

  if (machine.status === "outgoing_preview") {
    return (
      <OverlayFrame>
        <CallDevicePreview
          peerName={machine.context.peerName ?? ""}
          variant="outgoing"
          pending={props.pending}
          onConfirm={props.onConfirmOutgoingPreview}
          onCancel={props.onCancelPreview}
        />
      </OverlayFrame>
    );
  }

  if (machine.status === "outgoing_ringing") {
    return (
      <OverlayFrame>
        <CallStatusPanel
          title={t("assignmentCalls.status.ringing", {
            name: machine.context.peerName ?? "",
          })}
          error={machine.context.lastError?.message ?? null}
          onCancel={props.onHangUp}
          // `PREVIEW_CANCELLED` is a no-op once `outgoing_ringing` has been
          // reached (see call-state-machine.ts's transition table) -- a
          // failed `start` command needs the unconditional `RESET` instead
          // to actually return this tab to idle.
          onDismissError={props.onDismissEnded}
        />
      </OverlayFrame>
    );
  }

  if (machine.status === "incoming_ringing") {
    return (
      <IncomingCallSheet
        callerName={machine.context.peerName ?? ""}
        onAccept={props.onAcceptIncoming}
        onDecline={props.onDeclineIncoming}
      />
    );
  }

  if (machine.status === "incoming_preview") {
    return (
      <OverlayFrame>
        <CallDevicePreview
          peerName={machine.context.peerName ?? ""}
          variant="incoming"
          pending={props.pending}
          onConfirm={props.onConfirmIncomingPreview}
          onCancel={props.onCancelPreview}
        />
      </OverlayFrame>
    );
  }

  if (machine.status === "connecting") {
    return (
      <OverlayFrame>
        <CallStatusPanel
          title={t("assignmentCalls.status.connecting")}
          error={machine.context.lastError?.message ?? null}
          onCancel={props.onHangUp}
        />
      </OverlayFrame>
    );
  }

  if (machine.status === "active" || machine.status === "reconnecting") {
    if (props.isMinimized) {
      return (
        <MinimizedCallBar
          peerName={machine.context.peerName ?? ""}
          audioEnabled={props.audioEnabled}
          videoEnabled={props.videoEnabled}
          onToggleAudio={props.onToggleAudio}
          onToggleVideo={props.onToggleVideo}
          onHangUp={props.onHangUp}
          conversationId={machine.context.conversationId ?? ""}
        />
      );
    }
    return (
      <OverlayFrame>
        <CallStage
          peerName={machine.context.peerName ?? ""}
          remoteStream={props.remoteStream}
          localStream={props.localStream}
          isReconnecting={machine.status === "reconnecting"}
          degradedReason={props.degradedReason}
          controls={{
            audioEnabled: props.audioEnabled,
            videoEnabled: props.videoEnabled,
            screenShareEnabled: props.screenShareEnabled,
            canScreenShare: props.capabilities.hasGetDisplayMedia,
            onToggleAudio: props.onToggleAudio,
            onToggleVideo: props.onToggleVideo,
            onToggleScreenShare: props.onToggleScreenShare,
            onHangUp: props.onHangUp,
          }}
        />
      </OverlayFrame>
    );
  }

  // Every other status is handled above; "ended" is the only one left in
  // `CallMachineStatus`, which is why this isn't a redundant `if` -- it's
  // the exhaustive final case.
  return (
    <OverlayFrame>
      <CallStatusPanel
        title={t(
          `assignmentCalls.status.ended.${machine.context.call?.outcome ?? "ENDED"}`,
          { defaultValue: t("assignmentCalls.status.ended.ENDED") },
        )}
        error={null}
        onCancel={props.onDismissEnded}
        cancelLabel={t("common.close")}
      />
    </OverlayFrame>
  );
}

function OverlayFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function CallStatusPanel({
  title,
  error,
  onCancel,
  onDismissError,
  cancelLabel,
}: {
  title: string;
  error: string | null;
  onCancel: () => void;
  onDismissError?: () => void;
  cancelLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-card border border-border bg-card p-6 text-center"
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={error && onDismissError ? onDismissError : onCancel}
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {cancelLabel ?? t("common.cancel")}
      </button>
    </div>
  );
}
