import type {
  AttachmentScanState,
  AttachmentScanStateChangedEvent,
  AttachmentScanStateChangedPayload,
} from "../types/assignment-conversation.types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SCAN_STATES: readonly AttachmentScanState[] = [
  "scanning",
  "ready",
  "blocked",
  "unavailable",
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

function isScanState(value: unknown): value is AttachmentScanState {
  return (
    typeof value === "string" &&
    (SCAN_STATES as readonly string[]).includes(value)
  );
}

function isAttachmentScanStateChangedPayload(
  value: unknown,
): value is AttachmentScanStateChangedPayload {
  if (!isRecord(value)) return false;
  return (
    isUuid(value.attachmentId) &&
    isUuid(value.messageId) &&
    typeof value.filename === "string" &&
    value.filename.length > 0 &&
    Number.isInteger(value.byteSize) &&
    Number(value.byteSize) >= 0 &&
    typeof value.mimeType === "string" &&
    value.mimeType.length > 0 &&
    (value.caption === null || typeof value.caption === "string") &&
    isScanState(value.scanState)
  );
}

/**
 * Only ever emitted for an attachment already bound to a message the
 * recipient can see. The aggregate is the attachment, not the conversation —
 * `aggregateId` matches `payload.attachmentId`, mirroring how
 * `isConversationMessageCreatedEvent` cross-checks its own aggregate.
 */
export function isAttachmentScanStateChangedEvent(
  value: unknown,
): value is AttachmentScanStateChangedEvent {
  if (
    !isRecord(value) ||
    value.type !== "attachment.scan_state_changed" ||
    value.version !== 1 ||
    !isUuid(value.eventId) ||
    !isIsoDate(value.occurredAt) ||
    !isUuid(value.aggregateId) ||
    !Number.isInteger(value.aggregateVersion) ||
    Number(value.aggregateVersion) < 0 ||
    !isAttachmentScanStateChangedPayload(value.payload)
  ) {
    return false;
  }

  return value.payload.attachmentId === value.aggregateId;
}
