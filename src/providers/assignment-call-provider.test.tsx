// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type * as TanstackRouter from "@tanstack/react-router";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/lib/i18n";
import { RealtimeSocketContext } from "@/lib/socket/realtime-socket-context";
import type { AssignmentCallDto } from "@/modules/assignment-calls";
import { answerAssignmentCall } from "@/modules/assignment-calls/services/assignment-calls.service";
import { AssignmentCallProvider } from "./assignment-call-provider";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof TanstackRouter>("@tanstack/react-router");
  return {
    ...actual,
    useRouterState: (opts: { select: (state: { location: { pathname: string } }) => unknown }) =>
      opts.select({ location: { pathname: "/messages" } }),
    Link: (
      props: React.ComponentProps<"a"> & { to?: string; search?: unknown },
    ) => {
      const { to, search: _search, ...rest } = props;
      return <a href={to} {...rest} />;
    },
  };
});

vi.mock("@/modules/auth", () => ({
  useCurrentUserQuery: () => ({ data: { id: CALLEE_ID } }),
}));

vi.mock("@/modules/assignment-calls/services/assignment-calls.service", () => ({
  startAssignmentCall: vi.fn(),
  answerAssignmentCall: vi.fn(),
  declineAssignmentCall: vi.fn(),
  endAssignmentCall: vi.fn(),
  reconnectAssignmentCall: vi.fn(),
  getJoinCredentials: vi.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CONVERSATION_ID = "22222222-2222-4222-8222-222222222222";
const CALL_ID = "11111111-1111-4111-8111-111111111111";
const CALLER_ID = "33333333-3333-4333-8333-333333333333";
const CALLER_NAME = "Owner Name";
const CALLEE_ID = "44444444-4444-4444-8444-444444444444";
const CALLEE_SESSION_ID = "55555555-5555-4555-8555-555555555555";
const CALLER_SESSION_ID = "66666666-6666-4666-8666-666666666666";

function callDto(
  overrides: Partial<AssignmentCallDto> = {},
): AssignmentCallDto {
  return {
    callId: CALL_ID,
    conversationId: CONVERSATION_ID,
    callerId: CALLER_ID,
    callerName: CALLER_NAME,
    calleeId: CALLEE_ID,
    calleeName: "Contributor Name",
    outcome: "RINGING",
    startedAt: "2026-08-22T10:00:00.000Z",
    answeredAt: null,
    endedAt: null,
    durationSeconds: null,
    endReason: null,
    maxDurationSeconds: 3_600,
    ...overrides,
  };
}

function ringingEvent() {
  return {
    eventId: "77777777-7777-4777-8777-777777777777",
    type: "assignment_call.ringing",
    version: 1,
    occurredAt: "2026-08-22T10:00:00.000Z",
    aggregateId: CALL_ID,
    aggregateVersion: 1,
    payload: { call: callDto() },
  };
}

function answeredEvent() {
  return {
    eventId: "88888888-8888-4888-8888-888888888888",
    type: "assignment_call.answered",
    version: 1,
    occurredAt: "2026-08-22T10:00:05.000Z",
    aggregateId: CALL_ID,
    aggregateVersion: 2,
    payload: {
      call: callDto({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" }),
    },
  };
}

function endedEvent() {
  return {
    eventId: "99999999-9999-4999-8999-999999999999",
    type: "assignment_call.ended",
    version: 1,
    occurredAt: "2026-08-22T10:05:00.000Z",
    aggregateId: CALL_ID,
    aggregateVersion: 3,
    payload: {
      call: callDto({
        outcome: "ENDED",
        answeredAt: "2026-08-22T10:00:05.000Z",
        endedAt: "2026-08-22T10:05:00.000Z",
        endReason: "caller_ended",
      }),
    },
  };
}

/** Minimal fake matching the slice of `socket.io-client`'s `Socket` used here. */
class FakeSocket {
  private handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  emitCalls: unknown[][] = [];

  on(event: string, handler: (...args: unknown[]) => void): this {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)?.add(handler);
    return this;
  }

  off(event: string, handler: (...args: unknown[]) => void): this {
    this.handlers.get(event)?.delete(handler);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    this.emitCalls.push([event, ...args]);
    const ack = args.at(-1);
    if (typeof ack === "function") (ack as (a: unknown) => void)({ ok: true });
    return true;
  }

  trigger(event: string, ...args: unknown[]): void {
    for (const handler of [...(this.handlers.get(event) ?? [])]) handler(...args);
  }
}

/** Hand-rolled fake standing in for `RTCPeerConnection` -- same shape as
 * `lib/peer-connection.test.ts`'s fake, trimmed to what this test exercises. */
class FakeRTCRtpSender {
  track: { kind: string; stop: () => void } | null;
  constructor(track: { kind: string; stop: () => void } | null) {
    this.track = track;
  }
  async replaceTrack(track: { kind: string; stop: () => void } | null) {
    this.track = track;
  }
}

let sdpCounter = 0;

class FakeRTCPeerConnection {
  static instances: FakeRTCPeerConnection[] = [];

  iceConnectionState: RTCIceConnectionState = "new";
  signalingState: RTCSignalingState = "stable";
  localDescription: { type: RTCSdpType; sdp: string } | null = null;
  remoteDescription: { type: RTCSdpType; sdp: string } | null = null;

  onnegotiationneeded: (() => void) | null = null;
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null = null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;

  restartIce = vi.fn();
  close = vi.fn(() => {
    this.iceConnectionState = "closed";
  });
  setConfiguration = vi.fn();
  addIceCandidate = vi.fn(async () => undefined);

  private senders: FakeRTCRtpSender[] = [];

  constructor(_config: RTCConfiguration) {
    FakeRTCPeerConnection.instances.push(this);
  }

  addTrack(track: { kind: string; stop: () => void }, _stream: unknown) {
    const sender = new FakeRTCRtpSender(track);
    this.senders.push(sender);
    this.scheduleNegotiationNeeded();
    return sender as unknown as RTCRtpSender;
  }

  addTransceiver() {
    this.senders.push(new FakeRTCRtpSender(null));
    this.scheduleNegotiationNeeded();
  }

  getSenders(): RTCRtpSender[] {
    return this.senders as unknown as RTCRtpSender[];
  }

  private scheduleNegotiationNeeded(): void {
    queueMicrotask(() => this.onnegotiationneeded?.());
  }

  async setLocalDescription(): Promise<void> {
    if (this.signalingState === "stable") {
      sdpCounter += 1;
      this.localDescription = { type: "offer", sdp: `fake-offer-${sdpCounter}` };
      this.signalingState = "have-local-offer";
    } else if (this.signalingState === "have-remote-offer") {
      sdpCounter += 1;
      this.localDescription = { type: "answer", sdp: `fake-answer-${sdpCounter}` };
      this.signalingState = "stable";
    }
  }

  async setRemoteDescription(description: { type: RTCSdpType; sdp: string }): Promise<void> {
    if (description.type === "offer") {
      if (this.signalingState === "have-local-offer") {
        this.localDescription = null;
        this.signalingState = "stable";
      }
      this.remoteDescription = description;
      this.signalingState = "have-remote-offer";
    } else if (description.type === "answer") {
      this.remoteDescription = description;
      this.signalingState = "stable";
    }
  }

  setIceConnectionState(state: RTCIceConnectionState): void {
    this.iceConnectionState = state;
    this.oniceconnectionstatechange?.();
  }
}

describe("AssignmentCallProvider: durable events drive the call machine end to end", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  let socket: FakeSocket;

  beforeEach(async () => {
    await i18n.changeLanguage("ar");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    socket = new FakeSocket();
    FakeRTCPeerConnection.instances = [];
    vi.stubGlobal("RTCPeerConnection", FakeRTCPeerConnection);
    // happy-dom's default window is not a secure context; call-capabilities
    // correctly reports `canCall: false` there, so force it on for this test.
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      configurable: true,
    });
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      mediaDevices: {
        enumerateDevices: vi.fn().mockResolvedValue([]),
        getUserMedia: vi.fn(),
      },
    });
    vi.mocked(answerAssignmentCall).mockReset();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    queryClient.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  async function render() {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <RealtimeSocketContext.Provider
            value={{ socket: socket as never, connectionStatus: "connected" }}
          >
            <AssignmentCallProvider>
              <div data-testid="app-content">Route content</div>
            </AssignmentCallProvider>
          </RealtimeSocketContext.Provider>
        </QueryClientProvider>,
      );
    });
  }

  async function flush(times = 5) {
    for (let i = 0; i < times; i += 1) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  function findButtonByText(text: string): HTMLButtonElement {
    const button = [...document.body.querySelectorAll("button")].find((el) =>
      el.textContent.includes(text),
    );
    if (!button) throw new Error(`Button not found for text: ${text}`);
    return button;
  }

  function findButtonByAriaLabel(label: string): HTMLButtonElement {
    const button = document.body.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    );
    if (!button) throw new Error(`Button not found for aria-label: ${label}`);
    return button;
  }

  it("renders when the browser MediaStream global is unavailable", async () => {
    vi.stubGlobal("MediaStream", undefined);

    await expect(render()).resolves.toBeUndefined();
  });

  it("routes never touch app content while the call machine drives an incoming call from ringing to active, then tears down on a durable end", async () => {
    vi.mocked(answerAssignmentCall).mockResolvedValue({
      call: callDto({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" }),
      joinCredentials: {
        iceServers: [{ urls: ["stun:stun.example.com:3478"] }],
        expiresAt: "2026-08-22T10:10:00.000Z",
        maxDurationSeconds: 3_600,
      },
      callSessionId: CALLEE_SESSION_ID,
    });

    await render();
    expect(container.querySelector('[data-testid="app-content"]')).not.toBeNull();

    // 1. Durable ringing event names this user as the callee.
    await act(async () => socket.trigger("assignment_call.ringing", ringingEvent()));
    const alertDialog = document.body.querySelector('[role="alertdialog"]');
    expect(alertDialog).not.toBeNull();

    // 2. Accept -> device preview (camera/mic default off, listen-only join).
    const acceptLabel = i18n.t("assignmentCalls.incoming.acceptAria");
    await act(async () => {
      findButtonByAriaLabel(acceptLabel).click();
    });
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();

    // 3. Confirm the preview without enabling any device -> answer command.
    const joinLabel = i18n.t("assignmentCalls.preview.joinCall");
    await act(async () => {
      findButtonByText(joinLabel).click();
    });
    await flush();

    expect(answerAssignmentCall).toHaveBeenCalledWith(
      { callId: CALL_ID, idempotencyKey: expect.any(String) },
      expect.anything(),
    );
    const pc = FakeRTCPeerConnection.instances.at(0);
    expect(pc).toBeDefined();
    if (!pc) throw new Error("peer connection not created");

    // 4. The caller's offer arrives over the signal channel...
    await act(async () => {
      socket.trigger("assignment_call.signal", {
        callId: CALL_ID,
        fromUserId: CALLER_ID,
        fromCallSessionId: CALLER_SESSION_ID,
        kind: "offer",
        sdp: "caller-offer-sdp",
        signalSeq: 1,
        relayedAt: "2026-08-22T10:00:06.000Z",
      });
    });
    await flush();

    // ...and an answer is sent back.
    const answerSignals = socket.emitCalls.filter(
      ([event, message]) =>
        event === "assignment_call.signal" &&
        (message as { kind?: string }).kind === "answer",
    );
    expect(answerSignals).toHaveLength(1);
    expect(pc.signalingState).toBe("stable");

    // 5. A signal echoing this tab's OWN session id is silently ignored --
    // no additional candidate/description processing occurs.
    const answerSignalCountBefore = socket.emitCalls.length;
    await act(async () => {
      socket.trigger("assignment_call.signal", {
        callId: CALL_ID,
        fromUserId: CALLEE_ID,
        fromCallSessionId: CALLEE_SESSION_ID, // this tab's own session id
        kind: "ice_candidate",
        candidate: { candidate: "candidate:1", sdpMid: "0", sdpMLineIndex: 0 },
        signalSeq: 2,
        relayedAt: "2026-08-22T10:00:07.000Z",
      });
    });
    await flush();
    expect(pc.addIceCandidate).not.toHaveBeenCalled();
    expect(socket.emitCalls).toHaveLength(answerSignalCountBefore);

    // 6. The durable "answered" event is a harmless echo for this tab...
    await act(async () => socket.trigger("assignment_call.answered", answeredEvent()));

    // 7. ...and once ICE actually connects, the call becomes active.
    await act(async () => pc.setIceConnectionState("connected"));
    await flush();
    expect(document.body.querySelectorAll("video")).toHaveLength(2);

    // 8. A durable "ended" event forces teardown from active, no exceptions.
    await act(async () => socket.trigger("assignment_call.ended", endedEvent()));
    await flush();

    expect(pc.close).toHaveBeenCalledTimes(1);
    expect(document.body.querySelectorAll("video")).toHaveLength(0);
    // The route's own content was never touched by any of this.
    expect(container.querySelector('[data-testid="app-content"]')?.textContent).toBe(
      "Route content",
    );
  });
});
