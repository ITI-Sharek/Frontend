import type { Socket } from "socket.io-client";

import type {
  AssignmentCallSignalAck,
  AssignmentCallSignalInbound,
  AssignmentCallSignalOutbound,
} from "../types/assignment-call.types";

const SIGNAL_EVENT = "assignment_call.signal";
const DEFAULT_ACK_TIMEOUT_MS = 8_000;

export class SignalAckTimeoutError extends Error {
  constructor() {
    super("Timed out waiting for the server to acknowledge a call signal.");
    this.name = "SignalAckTimeoutError";
  }
}

export interface SignalingChannel {
  emitSignal: (
    payload: Omit<AssignmentCallSignalOutbound, "callId" | "callSessionId" | "signalSeq">,
  ) => Promise<AssignmentCallSignalAck>;
  onSignal: (callback: (signal: AssignmentCallSignalInbound) => void) => () => void;
  dispose: () => void;
}

/**
 * Thin wrapper around the shared socket, scoped to exactly one active call.
 *
 * The server relays on the plain `user:<id>` room -- there is no per-call
 * room -- so a signal fan-out reaches every open tab of a user, not just the
 * one running the call. `fromCallSessionId` filtering happens here, once,
 * against this call's own `callId`/`callSessionId` pair, so nothing
 * downstream has to re-check it: a tab with no matching `callId`, or whose
 * own session id matches the signal's `fromCallSessionId` (an echo of a
 * signal this same tab sent), silently drops it instead of acting on it.
 */
export function createSignalingChannel(
  socket: Socket,
  identity: { callId: string; callSessionId: string },
  options: { ackTimeoutMs?: number } = {},
): SignalingChannel {
  let seq = 0;
  const ackTimeoutMs = options.ackTimeoutMs ?? DEFAULT_ACK_TIMEOUT_MS;
  const activeTimers = new Set<ReturnType<typeof setTimeout>>();

  function emitSignal(
    payload: Omit<AssignmentCallSignalOutbound, "callId" | "callSessionId" | "signalSeq">,
  ): Promise<AssignmentCallSignalAck> {
    seq += 1;
    const message: AssignmentCallSignalOutbound = {
      ...payload,
      callId: identity.callId,
      callSessionId: identity.callSessionId,
      signalSeq: seq,
    };

    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        activeTimers.delete(timer);
        reject(new SignalAckTimeoutError());
      }, ackTimeoutMs);
      activeTimers.add(timer);

      socket.emit(SIGNAL_EVENT, message, (ack: AssignmentCallSignalAck) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        activeTimers.delete(timer);
        resolve(ack);
      });
    });
  }

  function onSignal(callback: (signal: AssignmentCallSignalInbound) => void): () => void {
    function handler(signal: AssignmentCallSignalInbound) {
      if (signal.callId !== identity.callId) return;
      if (signal.fromCallSessionId === identity.callSessionId) return;
      callback(signal);
    }
    socket.on(SIGNAL_EVENT, handler);
    return () => socket.off(SIGNAL_EVENT, handler);
  }

  function dispose(): void {
    for (const timer of activeTimers) clearTimeout(timer);
    activeTimers.clear();
  }

  return { emitSignal, onSignal, dispose };
}
