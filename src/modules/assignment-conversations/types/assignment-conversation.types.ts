export type AssignmentConversationStatus = "active" | "read_only";

export interface AssignmentConversationDto {
  conversationId: string;
  assignmentId: string;
  status: AssignmentConversationStatus;
  ownerId: string;
  ownerName: string;
  contributorId: string;
  contributorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  messageId: string;
  conversationId: string;
  sequence: number;
  senderId: string;
  senderName: string;
  body: string;
  replyToMessageId: string | null;
  createdAt: string;
  editedAt: string | null;
  retractedAt: string | null;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ConversationListParams {
  cursor?: string;
  limit?: number;
}

export interface MessageListParams extends ConversationListParams {
  query?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  idempotencyKey: string;
  body: string;
}

export interface ConversationMessageCreatedEvent {
  eventId: string;
  type: "conversation.message.created";
  version: 1;
  occurredAt: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: { message: MessageDto };
}
