import type {
  AssignmentCallDto,
  AssignmentCallEvent,
  AssignmentCallEventType,
  AssignmentCallOutcome,
} from "../types/assignment-call.types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EVENT_TYPES: readonly AssignmentCallEventType[] = [
  "assignment_call.ringing",
  "assignment_call.answered",
  "assignment_call.declined",
  "assignment_call.ended",
];

const OUTCOMES: readonly AssignmentCallOutcome[] = [
  "RINGING",
  "ANSWERED",
  "MISSED",
  "DECLINED",
  "FAILED_BUSY",
  "FAILED_PROVIDER",
  "ENDED",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isNullableIsoDate(value: unknown): value is string | null {
  return value === null || isIsoDate(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignmentCallOutcome(value: unknown): value is AssignmentCallOutcome {
  return typeof value === "string" && OUTCOMES.includes(value as AssignmentCallOutcome);
}

function isAssignmentCallDto(value: unknown): value is AssignmentCallDto {
  if (!isRecord(value)) return false;
  return (
    isUuid(value.callId) &&
    isUuid(value.conversationId) &&
    isUuid(value.callerId) &&
    isNonEmptyString(value.callerName) &&
    isUuid(value.calleeId) &&
    isNonEmptyString(value.calleeName) &&
    isAssignmentCallOutcome(value.outcome) &&
    isIsoDate(value.startedAt) &&
    isNullableIsoDate(value.answeredAt) &&
    isNullableIsoDate(value.endedAt) &&
    (value.durationSeconds === null ||
      (typeof value.durationSeconds === "number" && value.durationSeconds >= 0)) &&
    (value.endReason === null || typeof value.endReason === "string") &&
    typeof value.maxDurationSeconds === "number" &&
    value.maxDurationSeconds > 0
  );
}

function isAssignmentCallEventType(value: unknown): value is AssignmentCallEventType {
  return typeof value === "string" && EVENT_TYPES.includes(value as AssignmentCallEventType);
}

/**
 * Same durable envelope shape/validation approach as
 * `isConversationMessageCreatedEvent` -- the aggregate here is the call
 * itself, so `aggregateId` is checked against `payload.call.callId`, not the
 * conversation.
 */
export function isAssignmentCallEvent(value: unknown): value is AssignmentCallEvent {
  if (
    !isRecord(value) ||
    !isAssignmentCallEventType(value.type) ||
    value.version !== 1 ||
    !isUuid(value.eventId) ||
    !isIsoDate(value.occurredAt) ||
    !isUuid(value.aggregateId) ||
    !Number.isInteger(value.aggregateVersion) ||
    Number(value.aggregateVersion) <= 0 ||
    !isRecord(value.payload) ||
    !isAssignmentCallDto(value.payload.call)
  ) {
    return false;
  }

  return value.payload.call.callId === value.aggregateId;
}
