import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IceServerDto } from "../types/assignment-call.types";
import type { AssignmentCallPeerCallbacks } from "./peer-connection";
import { createAssignmentCallPeerConnection } from "./peer-connection";

/**
 * Hand-rolled fake standing in for `RTCPeerConnection` -- vitest + happy-dom
 * has no real WebRTC implementation. Models just enough of the spec's
 * signaling-state machine (stable / have-local-offer / have-remote-offer)
 * and offer/answer SDP typing for perfect negotiation to be meaningfully
 * exercised, plus the handful of methods `lib/peer-connection.ts` calls.
 */
class FakeRTCRtpSender {
  track: FakeMediaStreamTrack | null;
  replaceTrack = vi.fn(async (track: FakeMediaStreamTrack | null) => {
    this.track = track;
  });

  constructor(track: FakeMediaStreamTrack | null) {
    this.track = track;
  }
}

class FakeMediaStreamTrack {
  stop = vi.fn();
  constructor(public kind: "audio" | "video") {}
}

let sdpCounter = 0;

class FakeRTCPeerConnection {
  static instances: FakeRTCPeerConnection[] = [];

  iceConnectionState: RTCIceConnectionState = "new";
  signalingState: RTCSignalingState = "stable";
  localDescription: { type: RTCSdpType; sdp: string } | null = null;
  remoteDescription: { type: RTCSdpType; sdp: string } | null = null;
  configuration: RTCConfiguration;

  onnegotiationneeded: (() => void) | null = null;
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null = null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;

  restartIce = vi.fn();
  close = vi.fn(() => {
    this.iceConnectionState = "closed";
  });
  setConfiguration = vi.fn((config: RTCConfiguration) => {
    this.configuration = config;
  });

  private senders: FakeRTCRtpSender[] = [];

  constructor(config: RTCConfiguration) {
    this.configuration = config;
    FakeRTCPeerConnection.instances.push(this);
  }

  addTrack(track: FakeMediaStreamTrack, _stream: unknown): FakeRTCRtpSender {
    const sender = new FakeRTCRtpSender(track);
    this.senders.push(sender);
    this.scheduleNegotiationNeeded();
    return sender;
  }

  addTransceiver(_kind: "audio" | "video", init: { direction: string }): void {
    if (init.direction === "recvonly") {
      this.senders.push(new FakeRTCRtpSender(null));
    }
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
      this.localDescription = { type: "offer", sdp: `fake-offer-sdp-${sdpCounter}` };
      this.signalingState = "have-local-offer";
    } else if (this.signalingState === "have-remote-offer") {
      sdpCounter += 1;
      this.localDescription = { type: "answer", sdp: `fake-answer-sdp-${sdpCounter}` };
      this.signalingState = "stable";
    } else {
      throw new Error(`Cannot setLocalDescription from state ${this.signalingState}`);
    }
  }

  async setRemoteDescription(description: { type: RTCSdpType; sdp: string }): Promise<void> {
    if (description.type === "offer") {
      if (this.signalingState === "have-local-offer") {
        // Implicit rollback, per spec, before accepting the remote offer.
        this.localDescription = null;
        this.signalingState = "stable";
      }
      this.remoteDescription = description;
      this.signalingState = "have-remote-offer";
    } else if (description.type === "answer") {
      if (this.signalingState !== "have-local-offer") {
        throw new Error(`Cannot accept an answer from state ${this.signalingState}`);
      }
      this.remoteDescription = description;
      this.signalingState = "stable";
    }
  }

  async addIceCandidate(_candidate: RTCIceCandidateInit): Promise<void> {
    // No-op: candidate bookkeeping isn't relevant to the transitions under test.
  }

  /** Test helper -- simulates the browser delivering a remote track. */
  emitTrack(stream: MediaStream): void {
    this.ontrack?.({ streams: [stream] });
  }

  /** Test helper -- simulates a native ICE connection state transition. */
  setIceConnectionState(state: RTCIceConnectionState): void {
    this.iceConnectionState = state;
    this.oniceconnectionstatechange?.();
  }
}

async function flushMicrotasks(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) await Promise.resolve();
}

function makeCallbacks(): AssignmentCallPeerCallbacks & {
  offers: string[];
  answers: string[];
  candidates: RTCIceCandidateInit[];
  remoteStreams: (MediaStream | null)[];
  iceFailedCount: number;
} {
  const offers: string[] = [];
  const answers: string[] = [];
  const candidates: RTCIceCandidateInit[] = [];
  const remoteStreams: (MediaStream | null)[] = [];
  let iceFailedCount = 0;
  return {
    offers,
    answers,
    candidates,
    remoteStreams,
    get iceFailedCount() {
      return iceFailedCount;
    },
    onIceCandidate: (candidate) => candidates.push(candidate),
    onLocalOffer: (sdp) => offers.push(sdp),
    onLocalAnswer: (sdp) => answers.push(sdp),
    onRemoteStream: (stream) => remoteStreams.push(stream),
    onIceFailed: () => {
      iceFailedCount += 1;
    },
  };
}

const ICE_SERVERS: IceServerDto[] = [{ urls: ["stun:stun.example.com:3478"] }];

describe("createAssignmentCallPeerConnection", () => {
  beforeEach(() => {
    FakeRTCPeerConnection.instances = [];
    vi.stubGlobal("RTCPeerConnection", FakeRTCPeerConnection);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("completes one full offer/answer exchange between an impolite caller and a polite callee", async () => {
    const callerCallbacks = makeCallbacks();
    const caller = createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks: callerCallbacks,
    });
    const calleeCallbacks = makeCallbacks();
    const callee = createAssignmentCallPeerConnection({
      role: "callee",
      iceServers: ICE_SERVERS,
      callbacks: calleeCallbacks,
    });

    const callerPc = FakeRTCPeerConnection.instances[0];
    const calleePc = FakeRTCPeerConnection.instances[1];

    // Adding a track is what drives the caller's initial negotiationneeded.
    callerPc.addTrack(new FakeMediaStreamTrack("audio"), {});
    await flushMicrotasks();

    expect(callerCallbacks.offers).toHaveLength(1);
    await callee.applyRemoteOffer(callerCallbacks.offers[0]);
    expect(calleeCallbacks.answers).toHaveLength(1);

    await caller.applyRemoteAnswer(calleeCallbacks.answers[0]);

    expect(callerPc.signalingState).toBe("stable");
    expect(calleePc.signalingState).toBe("stable");
  });

  it("resolves an offer collision the standard perfect-negotiation way: polite accepts, impolite ignores", async () => {
    const callerCallbacks = makeCallbacks();
    const caller = createAssignmentCallPeerConnection({
      role: "caller", // impolite
      iceServers: ICE_SERVERS,
      callbacks: callerCallbacks,
    });
    const calleeCallbacks = makeCallbacks();
    const callee = createAssignmentCallPeerConnection({
      role: "callee", // polite
      iceServers: ICE_SERVERS,
      callbacks: calleeCallbacks,
    });

    const callerPc = FakeRTCPeerConnection.instances[0];
    const calleePc = FakeRTCPeerConnection.instances[1];

    // Both sides happen to make an offer at the same time.
    callerPc.addTrack(new FakeMediaStreamTrack("video"), {});
    calleePc.addTrack(new FakeMediaStreamTrack("video"), {});
    await flushMicrotasks();

    expect(callerCallbacks.offers).toHaveLength(1);
    expect(calleeCallbacks.offers).toHaveLength(1);

    // The impolite caller receives the polite callee's colliding offer and
    // must ignore it, keeping its own offer alive.
    await caller.applyRemoteOffer(calleeCallbacks.offers[0]);
    expect(callerPc.signalingState).toBe("have-local-offer");
    expect(callerPc.remoteDescription).toBeNull();
    expect(callerCallbacks.answers).toHaveLength(0);

    // The polite callee receives the impolite caller's colliding offer and
    // must roll back its own, accepting the caller's instead.
    await callee.applyRemoteOffer(callerCallbacks.offers[0]);
    expect(calleeCallbacks.answers).toHaveLength(1);
    expect(calleePc.signalingState).toBe("stable");
  });

  it("replaceTrack on an existing same-kind sender never fires negotiationneeded (screen-share swap)", async () => {
    const callbacks = makeCallbacks();
    const connection = createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
    });
    const pc = FakeRTCPeerConnection.instances[0];

    const cameraTrack = new FakeMediaStreamTrack("video");
    pc.addTrack(cameraTrack, {});
    await flushMicrotasks();
    expect(callbacks.offers).toHaveLength(1);

    const screenTrack = new FakeMediaStreamTrack("video");
    const swapped = await connection.replaceTrackForKind(
      "video",
      screenTrack as unknown as MediaStreamTrack,
    );
    await flushMicrotasks();

    expect(swapped).toBe(true);
    expect(callbacks.offers).toHaveLength(1); // unchanged -- no renegotiation
    const sender = pc.getSenders()[0] as unknown as FakeRTCRtpSender;
    expect(sender.replaceTrack).toHaveBeenCalledWith(screenTrack);
  });

  it("reports no sender to replace when there was never a local track of that kind", async () => {
    const callbacks = makeCallbacks();
    const connection = createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
    });

    const swapped = await connection.replaceTrackForKind(
      "video",
      new FakeMediaStreamTrack("video") as unknown as MediaStreamTrack,
    );

    expect(swapped).toBe(false);
  });

  it("adding a screen track via addLocalTrack when there was no camera track DOES renegotiate", async () => {
    const callbacks = makeCallbacks();
    const connection = createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
    });
    const stream = {} as MediaStream;
    const screenTrack = new FakeMediaStreamTrack("video") as unknown as MediaStreamTrack;

    connection.addLocalTrack(screenTrack, stream);
    await flushMicrotasks();

    expect(callbacks.offers).toHaveLength(1);
  });

  it("calls restartIce() when the ICE connection state becomes failed", () => {
    const callbacks = makeCallbacks();
    createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
    });
    const pc = FakeRTCPeerConnection.instances[0];

    pc.setIceConnectionState("failed");

    expect(pc.restartIce).toHaveBeenCalledTimes(1);
    expect(callbacks.iceFailedCount).toBe(1);
  });

  it("gives a disconnected connection a local grace window before treating it as failed", () => {
    vi.useFakeTimers();
    const callbacks = makeCallbacks();
    createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
      iceDisconnectGraceMs: 3_000,
    });
    const pc = FakeRTCPeerConnection.instances[0];

    pc.setIceConnectionState("disconnected");
    expect(pc.restartIce).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2_999);
    expect(pc.restartIce).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(pc.restartIce).toHaveBeenCalledTimes(1);
    expect(callbacks.iceFailedCount).toBe(1);

    vi.useRealTimers();
  });

  it("does not treat a disconnect as failed if it recovers within the grace window", () => {
    vi.useFakeTimers();
    const callbacks = makeCallbacks();
    createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
      iceDisconnectGraceMs: 3_000,
    });
    const pc = FakeRTCPeerConnection.instances[0];

    pc.setIceConnectionState("disconnected");
    vi.advanceTimersByTime(1_000);
    pc.setIceConnectionState("connected");
    vi.advanceTimersByTime(3_000);

    expect(pc.restartIce).not.toHaveBeenCalled();
    expect(callbacks.iceFailedCount).toBe(0);

    vi.useRealTimers();
  });

  it("teardown stops every local track and closes the connection", async () => {
    const callbacks = makeCallbacks();
    createAssignmentCallPeerConnection({
      role: "caller",
      iceServers: ICE_SERVERS,
      callbacks,
    });
    const connection = createAssignmentCallPeerConnection({
      role: "callee",
      iceServers: ICE_SERVERS,
      callbacks: makeCallbacks(),
    });
    const pc = FakeRTCPeerConnection.instances[1];
    const audioTrack = new FakeMediaStreamTrack("audio");
    const videoTrack = new FakeMediaStreamTrack("video");
    pc.addTrack(audioTrack, {});
    pc.addTrack(videoTrack, {});
    await flushMicrotasks();

    connection.teardown();

    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
    expect(pc.close).toHaveBeenCalledTimes(1);
  });

  it("exposes the remote stream via ontrack", () => {
    const callbacks = makeCallbacks();
    createAssignmentCallPeerConnection({
      role: "callee",
      iceServers: ICE_SERVERS,
      callbacks,
    });
    const pc = FakeRTCPeerConnection.instances[0];
    const remoteStream = {} as MediaStream;

    pc.emitTrack(remoteStream);

    expect(callbacks.remoteStreams).toEqual([remoteStream]);
  });
});
