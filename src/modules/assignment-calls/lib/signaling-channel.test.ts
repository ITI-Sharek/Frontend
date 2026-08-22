import { describe, expect, it, vi } from "vitest";

import type { AssignmentCallSignalInbound } from "../types/assignment-call.types";
import { SignalAckTimeoutError, createSignalingChannel } from "./signaling-channel";

/** Minimal fake matching the slice of `socket.io-client`'s `Socket` this module uses. */
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
    return true;
  }

  /** Test helper: simulate the server delivering an inbound event. */
  trigger(event: string, ...args: unknown[]): void {
    for (const handler of this.handlers.get(event) ?? []) handler(...args);
  }
}

const CALL_ID = "11111111-1111-4111-8111-111111111111";
const OWN_SESSION_ID = "22222222-2222-4222-8222-222222222222";
const PEER_SESSION_ID = "33333333-3333-4333-8333-333333333333";

function inboundSignal(
  overrides: Partial<AssignmentCallSignalInbound> = {},
): AssignmentCallSignalInbound {
  return {
    callId: CALL_ID,
    fromUserId: "44444444-4444-4444-8444-444444444444",
    fromCallSessionId: PEER_SESSION_ID,
    kind: "offer",
    sdp: "v=0...",
    signalSeq: 1,
    relayedAt: "2026-08-22T10:00:00.000Z",
    ...overrides,
  };
}

describe("createSignalingChannel", () => {
  it("emits with an incrementing signalSeq and resolves once the ack callback fires", async () => {
    const socket = new FakeSocket();
    const emitSpy = vi
      .spyOn(socket, "emit")
      .mockImplementation((_event, _message, ack) => {
        (ack as (a: unknown) => void)({ ok: true });
        return true;
      });
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });

    const first = await channel.emitSignal({ kind: "offer", sdp: "offer-sdp" });
    const second = await channel.emitSignal({ kind: "ice_candidate" });

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    const [, firstMessage] = emitSpy.mock.calls[0] as [string, { signalSeq: number }];
    const [, secondMessage] = emitSpy.mock.calls[1] as [string, { signalSeq: number }];
    expect(firstMessage.signalSeq).toBe(1);
    expect(secondMessage.signalSeq).toBe(2);
  });

  it("stamps every outbound signal with this call's own callId and callSessionId", async () => {
    const socket = new FakeSocket();
    const emitSpy = vi
      .spyOn(socket, "emit")
      .mockImplementation((_event, _message, ack) => {
        (ack as (a: unknown) => void)({ ok: true });
        return true;
      });
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });

    await channel.emitSignal({ kind: "answer", sdp: "answer-sdp" });

    const [, message] = emitSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(message.callId).toBe(CALL_ID);
    expect(message.callSessionId).toBe(OWN_SESSION_ID);
  });

  it("rejects with SignalAckTimeoutError when no ack arrives in time", async () => {
    vi.useFakeTimers();
    const socket = new FakeSocket();
    vi.spyOn(socket, "emit"); // never invokes the ack callback
    const channel = createSignalingChannel(
      socket as never,
      { callId: CALL_ID, callSessionId: OWN_SESSION_ID },
      { ackTimeoutMs: 1_000 },
    );

    const pending = channel.emitSignal({ kind: "offer" });
    const assertion = expect(pending).rejects.toBeInstanceOf(SignalAckTimeoutError);
    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;
    vi.useRealTimers();
  });

  it("delivers a signal for this exact call from the peer", () => {
    const socket = new FakeSocket();
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });
    const received: AssignmentCallSignalInbound[] = [];
    channel.onSignal((signal) => received.push(signal));

    socket.trigger("assignment_call.signal", inboundSignal());

    expect(received).toHaveLength(1);
  });

  it("drops a signal for a different call entirely", () => {
    const socket = new FakeSocket();
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });
    const received: AssignmentCallSignalInbound[] = [];
    channel.onSignal((signal) => received.push(signal));

    socket.trigger(
      "assignment_call.signal",
      inboundSignal({ callId: "99999999-9999-4999-8999-999999999999" }),
    );

    expect(received).toHaveLength(0);
  });

  it("drops a signal whose fromCallSessionId echoes this tab's own session (multi-tab fan-out)", () => {
    const socket = new FakeSocket();
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });
    const received: AssignmentCallSignalInbound[] = [];
    channel.onSignal((signal) => received.push(signal));

    socket.trigger(
      "assignment_call.signal",
      inboundSignal({ fromCallSessionId: OWN_SESSION_ID }),
    );

    expect(received).toHaveLength(0);
  });

  it("stops delivering after the unsubscribe function returned by onSignal is called", () => {
    const socket = new FakeSocket();
    const channel = createSignalingChannel(socket as never, {
      callId: CALL_ID,
      callSessionId: OWN_SESSION_ID,
    });
    const received: AssignmentCallSignalInbound[] = [];
    const unsubscribe = channel.onSignal((signal) => received.push(signal));

    unsubscribe();
    socket.trigger("assignment_call.signal", inboundSignal());

    expect(received).toHaveLength(0);
  });
});
