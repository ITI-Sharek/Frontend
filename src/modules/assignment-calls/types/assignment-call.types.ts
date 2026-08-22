export type AssignmentCallOutcome =
  | "RINGING"
  | "ANSWERED"
  | "MISSED"
  | "DECLINED"
  | "FAILED_BUSY"
  | "FAILED_PROVIDER"
  | "ENDED";

export interface AssignmentCallDto {
  callId: string;
  conversationId: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  outcome: AssignmentCallOutcome;
  startedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  endReason: string | null;
  maxDurationSeconds: number;
}

export interface IceServerDto {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface JoinCredentialsDto {
  iceServers: IceServerDto[];
  expiresAt: string;
  maxDurationSeconds: number;
}

/**
 * `callSessionId` is a random per-tab id minted fresh by the server on every
 * start/answer/reconnect. Never persist it across a tab reload.
 */
export interface StartOrAnswerCallResponseDto {
  call: AssignmentCallDto;
  joinCredentials: JoinCredentialsDto;
  callSessionId: string;
}

export interface AssignmentCallCommandPayload {
  callId: string;
  idempotencyKey: string;
}

export interface StartAssignmentCallPayload {
  conversationId: string;
  idempotencyKey: string;
}

export type AssignmentCallSignalKind =
  | "offer"
  | "answer"
  | "ice_candidate"
  | "renegotiate_offer"
  | "renegotiate_answer";

export interface AssignmentCallSignalCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment?: string;
}

/** Client -> server, event `assignment_call.signal`, sent WITH an ack callback. */
export interface AssignmentCallSignalOutbound {
  callId: string;
  callSessionId: string;
  kind: AssignmentCallSignalKind;
  sdp?: string;
  candidate?: AssignmentCallSignalCandidate;
  signalSeq: number;
}

export interface AssignmentCallSignalAck {
  ok: boolean;
  code?: string;
}

/**
 * Server -> the peer, event `assignment_call.signal`. `fromCallSessionId`
 * must always be compared against this tab's own `callSessionId` before the
 * signal is acted on -- the server fans out to every open tab of a user.
 */
export interface AssignmentCallSignalInbound {
  callId: string;
  fromUserId: string;
  fromCallSessionId: string;
  kind: AssignmentCallSignalKind;
  sdp?: string;
  candidate?: AssignmentCallSignalCandidate;
  signalSeq: number;
  relayedAt: string;
}

export type AssignmentCallEventType =
  | "assignment_call.ringing"
  | "assignment_call.answered"
  | "assignment_call.declined"
  | "assignment_call.ended";

/**
 * Same durable envelope shape as `conversation.message.created`. There is no
 * "missed" event name -- a missed call surfaces as `assignment_call.ended`
 * with `outcome: 'MISSED'`. Every other terminal transition (server-swept
 * decline, reconnect timeout, max duration) is also `assignment_call.ended`,
 * distinguished by `outcome`/`endReason`.
 */
export interface AssignmentCallEvent {
  eventId: string;
  type: AssignmentCallEventType;
  version: 1;
  occurredAt: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: { call: AssignmentCallDto };
}

export interface AssignmentCallApiError {
  code: string;
  message: string;
}
