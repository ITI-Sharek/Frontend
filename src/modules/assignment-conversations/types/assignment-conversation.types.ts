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

export type AttachmentScanState =
  | "scanning"
  | "ready"
  | "blocked"
  | "unavailable";

export interface ChatAttachmentDto {
  attachmentId: string;
  filename: string;
  byteSize: number;
  mimeType: string;
  caption: string | null;
  scanState: AttachmentScanState;
  /** Monotonic per-attachment counter, starts at 0. */
  eventVersion: number;
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
  attachments: ChatAttachmentDto[];
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
  /** Max 5 uuids; omitted (not sent empty) when there is nothing to attach. */
  attachmentUploadIds?: string[];
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

export interface CreateAttachmentUploadPayload {
  conversationId: string;
  file: File;
  idempotencyKey: string;
  /** 1-500 chars when present. */
  caption?: string;
}

export interface ChatAttachmentUploadDto {
  uploadId: string;
  filename: string;
  byteSize: number;
  mimeType: string;
  scanState: AttachmentScanState;
  expiresAt: string;
}

export interface AttachmentDownloadUrlPayload {
  conversationId: string;
  attachmentId: string;
}

export interface AttachmentDownloadUrlDto {
  url: string;
  expiresAt: string;
  disposition: "inline" | "attachment";
}

export interface ChatAttachmentUploadConstraints {
  maxBytes: number;
  maxPerMessage: number;
  allowedMimeTypes: string[];
}

export interface AttachmentScanStateChangedPayload {
  attachmentId: string;
  messageId: string;
  filename: string;
  byteSize: number;
  mimeType: string;
  caption: string | null;
  scanState: AttachmentScanState;
}

/**
 * Same envelope shape as {@link ConversationMessageCreatedEvent}. Emitted only
 * for an attachment already bound to a message the recipient can see — a scan
 * that finishes before the message is sent emits nothing, since the send
 * response already carried the final state.
 */
export interface AttachmentScanStateChangedEvent {
  eventId: string;
  type: "attachment.scan_state_changed";
  version: 1;
  occurredAt: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: AttachmentScanStateChangedPayload;
}
