import type {
  AssignmentCallDto,
  JoinCredentialsDto,
} from "../types/assignment-call.types";

/**
 * Pure reducer for the lifecycle of at most one call this tab is party to.
 * Zero browser APIs, zero imports beyond this module's own types -- every
 * transition is a plain data transformation so it can be exhaustively unit
 * tested with no mocks. Effects (HTTP commands, `RTCPeerConnection` wiring,
 * timers) live in `assignment-call-provider.tsx` and `peer-connection.ts`;
 * they dispatch actions here once something actually happened.
 *
 * Two call flows share these states:
 *   caller:  idle -> outgoing_preview -> outgoing_ringing -> connecting -> active -> reconnecting -> ended
 *   callee:  idle -> incoming_ringing -> incoming_preview  -> connecting -> active -> reconnecting -> ended
 *
 * Hard rule: a durable event always wins over local optimism.
 * `DURABLE_ENDED` forces `ended` from ANY status, no exceptions -- including
 * `active` and `reconnecting`.
 */
export type CallMachineStatus =
  | "idle"
  | "outgoing_preview"
  | "outgoing_ringing"
  | "incoming_ringing"
  | "incoming_preview"
  | "connecting"
  | "active"
  | "reconnecting"
  | "ended";

export type CallMachineRole = "caller" | "callee";

export interface CallMachineError {
  code?: string;
  message: string;
}

export interface CallMachineContext {
  callId: string | null;
  conversationId: string | null;
  callSessionId: string | null;
  role: CallMachineRole | null;
  peerId: string | null;
  peerName: string | null;
  call: AssignmentCallDto | null;
  joinCredentials: JoinCredentialsDto | null;
  /** Bumped on every `ICE_FAILED` received while already `reconnecting`. */
  reconnectAttempts: number;
  lastError: CallMachineError | null;
}

export interface CallMachineState {
  status: CallMachineStatus;
  context: CallMachineContext;
}

export type CallMachineAction =
  | { type: "RESET" }
  | {
      type: "START_REQUESTED";
      conversationId: string;
      calleeId: string;
      calleeName: string;
    }
  | { type: "PREVIEW_CANCELLED" }
  | { type: "PREVIEW_CONFIRMED" }
  | {
      type: "OUTGOING_RINGING";
      call: AssignmentCallDto;
      joinCredentials: JoinCredentialsDto;
      callSessionId: string;
    }
  | { type: "INCOMING_CALL"; call: AssignmentCallDto }
  | { type: "ACCEPT_INCOMING_CALL" }
  | { type: "DECLINE_INCOMING_CALL" }
  | {
      type: "PEER_SESSION_READY";
      call: AssignmentCallDto;
      joinCredentials: JoinCredentialsDto;
      callSessionId: string;
    }
  | { type: "DURABLE_ANSWERED"; call: AssignmentCallDto }
  | { type: "PEER_CONNECTED" }
  | { type: "ICE_DISCONNECTED" }
  | { type: "ICE_FAILED" }
  | { type: "RECONNECTED" }
  | { type: "DURABLE_ENDED"; call: AssignmentCallDto }
  | { type: "COMMAND_FAILED"; error: CallMachineError }
  | { type: "LOCAL_HANGUP" };

const EMPTY_CONTEXT: CallMachineContext = {
  callId: null,
  conversationId: null,
  callSessionId: null,
  role: null,
  peerId: null,
  peerName: null,
  call: null,
  joinCredentials: null,
  reconnectAttempts: 0,
  lastError: null,
};

export const INITIAL_CALL_MACHINE_STATE: CallMachineState = {
  status: "idle",
  context: EMPTY_CONTEXT,
};

function withContext(
  status: CallMachineStatus,
  context: Partial<CallMachineContext>,
  state: CallMachineState,
): CallMachineState {
  return { status, context: { ...state.context, ...context } };
}

/** Same status, same context -- returns the identical object reference. */
function unchanged(state: CallMachineState): CallMachineState {
  return state;
}

function reset(): CallMachineState {
  return { status: "idle", context: EMPTY_CONTEXT };
}

function attachSession(
  state: CallMachineState,
  status: CallMachineStatus,
  data: {
    call: AssignmentCallDto;
    joinCredentials: JoinCredentialsDto;
    callSessionId: string;
  },
): CallMachineState {
  return withContext(
    status,
    {
      callId: data.call.callId,
      conversationId: data.call.conversationId,
      callSessionId: data.callSessionId,
      call: data.call,
      joinCredentials: data.joinCredentials,
    },
    state,
  );
}

/** `error` always updates; every other field (including `status`) is preserved. */
function withError(
  state: CallMachineState,
  error: CallMachineError,
): CallMachineState {
  return withContext(state.status, { lastError: error }, state);
}

function endWith(
  state: CallMachineState,
  call: AssignmentCallDto | null,
): CallMachineState {
  return withContext(
    "ended",
    {
      call: call ?? state.context.call,
      callId: call?.callId ?? state.context.callId,
    },
    state,
  );
}

export function callStateMachineReducer(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  // `COMMAND_FAILED` never changes `status` -- it only ever records the
  // latest error so the UI can surface it without derailing whatever the
  // call was already doing. `RESET` and `DURABLE_ENDED` are handled the
  // same way in every status: RESET always clears to idle, and a durable
  // ended/declined event always wins, per the hard rule above.
  if (action.type === "COMMAND_FAILED") return withError(state, action.error);
  if (action.type === "RESET") return reset();
  if (action.type === "DURABLE_ENDED") return endWith(state, action.call);

  switch (state.status) {
    case "idle":
      return fromIdle(state, action);
    case "outgoing_preview":
      return fromOutgoingPreview(state, action);
    case "outgoing_ringing":
      return fromOutgoingRinging(state, action);
    case "incoming_ringing":
      return fromIncomingRinging(state, action);
    case "incoming_preview":
      return fromIncomingPreview(state, action);
    case "connecting":
      return fromConnecting(state, action);
    case "active":
      return fromActive(state, action);
    case "reconnecting":
      return fromReconnecting(state, action);
    case "ended":
      return fromEnded(state, action);
    default:
      return unchanged(state);
  }
}

function fromIdle(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "START_REQUESTED":
      return withContext(
        "outgoing_preview",
        {
          conversationId: action.conversationId,
          role: "caller",
          peerId: action.calleeId,
          peerName: action.calleeName,
          callId: null,
          callSessionId: null,
          call: null,
          joinCredentials: null,
          reconnectAttempts: 0,
          lastError: null,
        },
        state,
      );
    case "INCOMING_CALL":
      return withContext(
        "incoming_ringing",
        {
          callId: action.call.callId,
          conversationId: action.call.conversationId,
          role: "callee",
          peerId: action.call.callerId,
          peerName: action.call.callerName,
          call: action.call,
          callSessionId: null,
          joinCredentials: null,
          reconnectAttempts: 0,
          lastError: null,
        },
        state,
      );
    default:
      return unchanged(state);
  }
}

function fromOutgoingPreview(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "PREVIEW_CANCELLED":
    case "LOCAL_HANGUP":
      return reset();
    case "PREVIEW_CONFIRMED":
      return withContext("outgoing_ringing", {}, state);
    case "OUTGOING_RINGING":
      return attachSession(state, "outgoing_ringing", action);
    default:
      return unchanged(state);
  }
}

function fromOutgoingRinging(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "OUTGOING_RINGING":
      return attachSession(state, "outgoing_ringing", action);
    case "DURABLE_ANSWERED":
      return withContext("connecting", { call: action.call }, state);
    case "LOCAL_HANGUP":
      return endWith(state, null);
    default:
      return unchanged(state);
  }
}

function fromIncomingRinging(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "INCOMING_CALL":
      return withContext("incoming_ringing", { call: action.call }, state);
    case "ACCEPT_INCOMING_CALL":
      return withContext("incoming_preview", {}, state);
    case "DECLINE_INCOMING_CALL":
      return reset();
    case "DURABLE_ANSWERED":
      // Another of this user's tabs answered first -- dismiss silently.
      return reset();
    default:
      return unchanged(state);
  }
}

function fromIncomingPreview(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "PREVIEW_CANCELLED":
    case "DECLINE_INCOMING_CALL":
      return reset();
    case "PREVIEW_CONFIRMED":
      return withContext("connecting", {}, state);
    case "PEER_SESSION_READY":
      return attachSession(state, "connecting", action);
    case "DURABLE_ANSWERED":
      return withContext("connecting", { call: action.call }, state);
    default:
      return unchanged(state);
  }
}

function fromConnecting(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "PEER_SESSION_READY":
      return attachSession(state, "connecting", action);
    case "PEER_CONNECTED":
      return withContext("active", {}, state);
    case "ICE_FAILED":
      // Never reached "connected" once -- nothing to reconnect FROM.
      return endWith(state, null);
    case "LOCAL_HANGUP":
      return endWith(state, null);
    default:
      return unchanged(state);
  }
}

function fromActive(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "ICE_DISCONNECTED":
    case "ICE_FAILED":
      return withContext("reconnecting", {}, state);
    case "LOCAL_HANGUP":
      return endWith(state, null);
    default:
      return unchanged(state);
  }
}

function fromReconnecting(
  state: CallMachineState,
  action: CallMachineAction,
): CallMachineState {
  switch (action.type) {
    case "ICE_FAILED":
      return withContext(
        "reconnecting",
        { reconnectAttempts: state.context.reconnectAttempts + 1 },
        state,
      );
    case "RECONNECTED":
      return withContext("active", { reconnectAttempts: 0 }, state);
    case "LOCAL_HANGUP":
      return endWith(state, null);
    default:
      return unchanged(state);
  }
}

function fromEnded(
  state: CallMachineState,
  _action: CallMachineAction,
): CallMachineState {
  return unchanged(state);
}
