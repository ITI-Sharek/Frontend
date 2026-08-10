import type {
  ConversationMessageCreatedEvent,
  MessageDto,
} from "../types/assignment-conversation.types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isMessageDto(value: unknown): value is MessageDto {
  if (!isRecord(value)) return false;
  return (
    isUuid(value.messageId) &&
    isUuid(value.conversationId) &&
    Number.isInteger(value.sequence) &&
    Number(value.sequence) > 0 &&
    isUuid(value.senderId) &&
    typeof value.senderName === "string" &&
    value.senderName.trim().length > 0 &&
    typeof value.body === "string" &&
    [...value.body].length > 0 &&
    [...value.body].length <= 4_000 &&
    (value.replyToMessageId === null || isUuid(value.replyToMessageId)) &&
    isIsoDate(value.createdAt) &&
    isNullableIsoDate(value.editedAt) &&
    isNullableIsoDate(value.retractedAt)
  );
}

export function isConversationMessageCreatedEvent(
  value: unknown,
): value is ConversationMessageCreatedEvent {
  if (
    !isRecord(value) ||
    value.type !== "conversation.message.created" ||
    value.version !== 1 ||
    !isUuid(value.eventId) ||
    !isIsoDate(value.occurredAt) ||
    !isUuid(value.aggregateId) ||
    !Number.isInteger(value.aggregateVersion) ||
    Number(value.aggregateVersion) <= 0 ||
    !isRecord(value.payload) ||
    !isMessageDto(value.payload.message)
  ) {
    return false;
  }

  return (
    value.payload.message.conversationId === value.aggregateId &&
    value.payload.message.sequence === value.aggregateVersion
  );
}
