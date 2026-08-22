import { describe, expect, it } from "vitest";

import type {
  AssignmentCallDto,
  JoinCredentialsDto,
} from "../types/assignment-call.types";
import type {
  CallMachineAction,
  CallMachineState,
  CallMachineStatus,
} from "./call-state-machine";
import {
  INITIAL_CALL_MACHINE_STATE,
  callStateMachineReducer,
} from "./call-state-machine";

function makeCall(overrides: Partial<AssignmentCallDto> = {}): AssignmentCallDto {
  return {
    callId: "11111111-1111-4111-8111-111111111111",
    conversationId: "22222222-2222-4222-8222-222222222222",
    callerId: "33333333-3333-4333-8333-333333333333",
    callerName: "Owner Name",
    calleeId: "44444444-4444-4444-8444-444444444444",
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

function makeCredentials(): JoinCredentialsDto {
  return {
    iceServers: [{ urls: ["stun:stun.example.com:3478"] }],
    expiresAt: "2026-08-22T10:05:00.000Z",
    maxDurationSeconds: 3_600,
  };
}

const CALL_SESSION_ID = "55555555-5555-4555-8555-555555555555";

/** Every action type the reducer accepts, each built with neutral fixture data. */
function buildAction(type: CallMachineAction["type"]): CallMachineAction {
  switch (type) {
    case "RESET":
      return { type: "RESET" };
    case "START_REQUESTED":
      return {
        type: "START_REQUESTED",
        conversationId: "22222222-2222-4222-8222-222222222222",
        calleeId: "44444444-4444-4444-8444-444444444444",
        calleeName: "Contributor Name",
      };
    case "PREVIEW_CANCELLED":
      return { type: "PREVIEW_CANCELLED" };
    case "PREVIEW_CONFIRMED":
      return { type: "PREVIEW_CONFIRMED" };
    case "OUTGOING_RINGING":
      return {
        type: "OUTGOING_RINGING",
        call: makeCall(),
        joinCredentials: makeCredentials(),
        callSessionId: CALL_SESSION_ID,
      };
    case "INCOMING_CALL":
      return { type: "INCOMING_CALL", call: makeCall() };
    case "ACCEPT_INCOMING_CALL":
      return { type: "ACCEPT_INCOMING_CALL" };
    case "DECLINE_INCOMING_CALL":
      return { type: "DECLINE_INCOMING_CALL" };
    case "PEER_SESSION_READY":
      return {
        type: "PEER_SESSION_READY",
        call: makeCall({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" }),
        joinCredentials: makeCredentials(),
        callSessionId: CALL_SESSION_ID,
      };
    case "DURABLE_ANSWERED":
      return {
        type: "DURABLE_ANSWERED",
        call: makeCall({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" }),
      };
    case "PEER_CONNECTED":
      return { type: "PEER_CONNECTED" };
    case "ICE_DISCONNECTED":
      return { type: "ICE_DISCONNECTED" };
    case "ICE_FAILED":
      return { type: "ICE_FAILED" };
    case "RECONNECTED":
      return { type: "RECONNECTED" };
    case "DURABLE_ENDED":
      return {
        type: "DURABLE_ENDED",
        call: makeCall({ outcome: "ENDED", endedAt: "2026-08-22T10:10:00.000Z", endReason: "callee_ended" }),
      };
    case "COMMAND_FAILED":
      return { type: "COMMAND_FAILED", error: { code: "ASSIGNMENT_CALL_NOT_FOUND", message: "Gone" } };
    case "LOCAL_HANGUP":
      return { type: "LOCAL_HANGUP" };
  }
}

const ALL_ACTION_TYPES: CallMachineAction["type"][] = [
  "RESET",
  "START_REQUESTED",
  "PREVIEW_CANCELLED",
  "PREVIEW_CONFIRMED",
  "OUTGOING_RINGING",
  "INCOMING_CALL",
  "ACCEPT_INCOMING_CALL",
  "DECLINE_INCOMING_CALL",
  "PEER_SESSION_READY",
  "DURABLE_ANSWERED",
  "PEER_CONNECTED",
  "ICE_DISCONNECTED",
  "ICE_FAILED",
  "RECONNECTED",
  "DURABLE_ENDED",
  "COMMAND_FAILED",
  "LOCAL_HANGUP",
];

const ALL_STATUSES: CallMachineStatus[] = [
  "idle",
  "outgoing_preview",
  "outgoing_ringing",
  "incoming_ringing",
  "incoming_preview",
  "connecting",
  "active",
  "reconnecting",
  "ended",
];

/** Non-global action types that produce a defined transition for a given status. */
const MEANINGFUL_BY_STATUS: Record<
  Exclude<CallMachineStatus, never>,
  Partial<Record<CallMachineAction["type"], CallMachineStatus>>
> = {
  idle: {
    START_REQUESTED: "outgoing_preview",
    INCOMING_CALL: "incoming_ringing",
  },
  outgoing_preview: {
    PREVIEW_CANCELLED: "idle",
    PREVIEW_CONFIRMED: "outgoing_ringing",
    OUTGOING_RINGING: "outgoing_ringing",
    LOCAL_HANGUP: "idle",
  },
  outgoing_ringing: {
    OUTGOING_RINGING: "outgoing_ringing",
    DURABLE_ANSWERED: "connecting",
    LOCAL_HANGUP: "ended",
  },
  incoming_ringing: {
    INCOMING_CALL: "incoming_ringing",
    ACCEPT_INCOMING_CALL: "incoming_preview",
    DECLINE_INCOMING_CALL: "idle",
    DURABLE_ANSWERED: "idle",
  },
  incoming_preview: {
    PREVIEW_CANCELLED: "idle",
    DECLINE_INCOMING_CALL: "idle",
    PREVIEW_CONFIRMED: "connecting",
    PEER_SESSION_READY: "connecting",
    DURABLE_ANSWERED: "connecting",
  },
  connecting: {
    PEER_SESSION_READY: "connecting",
    PEER_CONNECTED: "active",
    ICE_FAILED: "ended",
    LOCAL_HANGUP: "ended",
  },
  active: {
    ICE_DISCONNECTED: "reconnecting",
    ICE_FAILED: "reconnecting",
    LOCAL_HANGUP: "ended",
  },
  reconnecting: {
    ICE_FAILED: "reconnecting",
    RECONNECTED: "active",
    LOCAL_HANGUP: "ended",
  },
  ended: {},
};

/** The three actions handled identically regardless of current status. */
const GLOBAL_ACTION_TYPES: CallMachineAction["type"][] = [
  "RESET",
  "DURABLE_ENDED",
  "COMMAND_FAILED",
];

function stateAt(status: CallMachineStatus): CallMachineState {
  return { ...INITIAL_CALL_MACHINE_STATE, status, context: { ...INITIAL_CALL_MACHINE_STATE.context } };
}

describe("callStateMachineReducer: full transition table", () => {
  for (const status of ALL_STATUSES) {
    describe(`from "${status}"`, () => {
      const meaningful = MEANINGFUL_BY_STATUS[status];
      const localActionTypes = ALL_ACTION_TYPES.filter(
        (type) => !GLOBAL_ACTION_TYPES.includes(type),
      );

      for (const type of localActionTypes) {
        const expected = meaningful[type];

        if (expected === undefined) {
          it(`ignores ${type} (no-op, same reference)`, () => {
            const state = stateAt(status);
            const result = callStateMachineReducer(state, buildAction(type));
            expect(result).toBe(state);
          });
        } else {
          it(`handles ${type} -> "${expected}"`, () => {
            const state = stateAt(status);
            const result = callStateMachineReducer(state, buildAction(type));
            expect(result.status).toBe(expected);
            expect(result).not.toBe(state);
          });
        }
      }

      it("RESET always clears to idle", () => {
        const state = stateAt(status);
        const result = callStateMachineReducer(state, buildAction("RESET"));
        expect(result.status).toBe("idle");
        expect(result.context.callId).toBeNull();
        expect(result.context.call).toBeNull();
        expect(result.context.role).toBeNull();
      });

      it("DURABLE_ENDED always forces ended (hard rule: durable wins over local optimism)", () => {
        const state = stateAt(status);
        const action = buildAction("DURABLE_ENDED") as Extract<
          CallMachineAction,
          { type: "DURABLE_ENDED" }
        >;
        const result = callStateMachineReducer(state, action);
        expect(result.status).toBe("ended");
        expect(result.context.call).toEqual(action.call);
        expect(result.context.callId).toBe(action.call.callId);
      });

      it("COMMAND_FAILED never changes status, only records the error", () => {
        const state = stateAt(status);
        const action = buildAction("COMMAND_FAILED") as Extract<
          CallMachineAction,
          { type: "COMMAND_FAILED" }
        >;
        const result = callStateMachineReducer(state, action);
        expect(result.status).toBe(status);
        expect(result.context.lastError).toEqual(action.error);
      });
    });
  }
});

describe("callStateMachineReducer: hard rule on the exact states called out in the spec", () => {
  it("forces ended from active even mid-call", () => {
    const active: CallMachineState = {
      status: "active",
      context: {
        ...INITIAL_CALL_MACHINE_STATE.context,
        callId: "11111111-1111-4111-8111-111111111111",
        call: makeCall({ outcome: "ANSWERED" }),
      },
    };
    const endedCall = makeCall({ outcome: "ENDED", endReason: "max_duration" });
    const result = callStateMachineReducer(active, {
      type: "DURABLE_ENDED",
      call: endedCall,
    });
    expect(result.status).toBe("ended");
    expect(result.context.call).toEqual(endedCall);
  });

  it("forces ended from reconnecting", () => {
    const reconnecting: CallMachineState = {
      status: "reconnecting",
      context: {
        ...INITIAL_CALL_MACHINE_STATE.context,
        callId: "11111111-1111-4111-8111-111111111111",
        call: makeCall({ outcome: "ANSWERED" }),
      },
    };
    const endedCall = makeCall({ outcome: "ENDED", endReason: "reconnect_timeout" });
    const result = callStateMachineReducer(reconnecting, {
      type: "DURABLE_ENDED",
      call: endedCall,
    });
    expect(result.status).toBe("ended");
    expect(result.context.call).toEqual(endedCall);
  });
});

describe("callStateMachineReducer: end-to-end flows", () => {
  it("drives a full outgoing (caller) call from idle to active and back to idle", () => {
    let state = INITIAL_CALL_MACHINE_STATE;

    state = callStateMachineReducer(state, {
      type: "START_REQUESTED",
      conversationId: "22222222-2222-4222-8222-222222222222",
      calleeId: "44444444-4444-4444-8444-444444444444",
      calleeName: "Contributor Name",
    });
    expect(state.status).toBe("outgoing_preview");
    expect(state.context.role).toBe("caller");

    state = callStateMachineReducer(state, { type: "PREVIEW_CONFIRMED" });
    expect(state.status).toBe("outgoing_ringing");

    const ringingCall = makeCall();
    state = callStateMachineReducer(state, {
      type: "OUTGOING_RINGING",
      call: ringingCall,
      joinCredentials: makeCredentials(),
      callSessionId: CALL_SESSION_ID,
    });
    expect(state.status).toBe("outgoing_ringing");
    expect(state.context.callId).toBe(ringingCall.callId);
    expect(state.context.callSessionId).toBe(CALL_SESSION_ID);

    const answeredCall = makeCall({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" });
    state = callStateMachineReducer(state, { type: "DURABLE_ANSWERED", call: answeredCall });
    expect(state.status).toBe("connecting");

    state = callStateMachineReducer(state, { type: "PEER_CONNECTED" });
    expect(state.status).toBe("active");

    state = callStateMachineReducer(state, { type: "ICE_DISCONNECTED" });
    expect(state.status).toBe("reconnecting");

    state = callStateMachineReducer(state, { type: "RECONNECTED" });
    expect(state.status).toBe("active");

    const endedCall = makeCall({ outcome: "ENDED", endedAt: "2026-08-22T10:20:00.000Z" });
    state = callStateMachineReducer(state, { type: "DURABLE_ENDED", call: endedCall });
    expect(state.status).toBe("ended");

    state = callStateMachineReducer(state, { type: "RESET" });
    expect(state).toEqual(INITIAL_CALL_MACHINE_STATE);
  });

  it("drives a full incoming (callee) call from idle to active", () => {
    let state = INITIAL_CALL_MACHINE_STATE;

    const ringingCall = makeCall();
    state = callStateMachineReducer(state, { type: "INCOMING_CALL", call: ringingCall });
    expect(state.status).toBe("incoming_ringing");
    expect(state.context.role).toBe("callee");
    expect(state.context.peerId).toBe(ringingCall.callerId);

    state = callStateMachineReducer(state, { type: "ACCEPT_INCOMING_CALL" });
    expect(state.status).toBe("incoming_preview");

    state = callStateMachineReducer(state, { type: "PREVIEW_CONFIRMED" });
    expect(state.status).toBe("connecting");

    const answeredCall = makeCall({ outcome: "ANSWERED", answeredAt: "2026-08-22T10:00:05.000Z" });
    state = callStateMachineReducer(state, {
      type: "PEER_SESSION_READY",
      call: answeredCall,
      joinCredentials: makeCredentials(),
      callSessionId: CALL_SESSION_ID,
    });
    expect(state.status).toBe("connecting");
    expect(state.context.callSessionId).toBe(CALL_SESSION_ID);

    state = callStateMachineReducer(state, { type: "PEER_CONNECTED" });
    expect(state.status).toBe("active");
  });

  it("dismisses an incoming call silently when another tab answers it first", () => {
    let state = INITIAL_CALL_MACHINE_STATE;
    const ringingCall = makeCall();
    state = callStateMachineReducer(state, { type: "INCOMING_CALL", call: ringingCall });
    expect(state.status).toBe("incoming_ringing");

    const answeredElsewhere = makeCall({ outcome: "ANSWERED" });
    state = callStateMachineReducer(state, { type: "DURABLE_ANSWERED", call: answeredElsewhere });
    expect(state.status).toBe("idle");
  });

  it("declining an incoming call returns straight to idle without touching a peer connection", () => {
    let state = INITIAL_CALL_MACHINE_STATE;
    state = callStateMachineReducer(state, { type: "INCOMING_CALL", call: makeCall() });
    state = callStateMachineReducer(state, { type: "DECLINE_INCOMING_CALL" });
    expect(state).toEqual(INITIAL_CALL_MACHINE_STATE);
  });

  it("an ICE failure during initial connection ends the call rather than entering reconnecting", () => {
    let state = INITIAL_CALL_MACHINE_STATE;
    state = callStateMachineReducer(state, { type: "INCOMING_CALL", call: makeCall() });
    state = callStateMachineReducer(state, { type: "ACCEPT_INCOMING_CALL" });
    state = callStateMachineReducer(state, { type: "PREVIEW_CONFIRMED" });
    expect(state.status).toBe("connecting");

    state = callStateMachineReducer(state, { type: "ICE_FAILED" });
    expect(state.status).toBe("ended");
  });

  it("bumps reconnectAttempts on repeated ICE failures while already reconnecting", () => {
    const reconnecting: CallMachineState = {
      status: "reconnecting",
      context: { ...INITIAL_CALL_MACHINE_STATE.context, reconnectAttempts: 0 },
    };
    const once = callStateMachineReducer(reconnecting, { type: "ICE_FAILED" });
    expect(once.context.reconnectAttempts).toBe(1);
    const twice = callStateMachineReducer(once, { type: "ICE_FAILED" });
    expect(twice.context.reconnectAttempts).toBe(2);
  });
});
