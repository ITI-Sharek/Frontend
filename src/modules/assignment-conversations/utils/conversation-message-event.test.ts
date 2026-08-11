import { describe, expect, it } from "vitest";

import { isConversationMessageCreatedEvent } from "./conversation-message-event";

const event = {
  eventId: "88888888-8888-4888-8888-888888888888",
  type: "conversation.message.created",
  version: 1,
  occurredAt: "2026-08-09T12:03:00.000Z",
  aggregateId: "55555555-5555-4555-8555-555555555555",
  aggregateVersion: 2,
  payload: {
    message: {
      messageId: "66666666-6666-4666-8666-666666666666",
      conversationId: "55555555-5555-4555-8555-555555555555",
      sequence: 2,
      senderId: "22222222-2222-4222-8222-222222222222",
      senderName: "Contributor Name",
      body: "Committed message",
      replyToMessageId: null,
      createdAt: "2026-08-09T12:03:00.000Z",
      editedAt: null,
      retractedAt: null,
    },
  },
};

describe("conversation Message realtime event", () => {
  it("accepts only a version-one created envelope whose aggregate and sequence match the Message", () => {
    expect(isConversationMessageCreatedEvent(event)).toBe(true);
    expect(
      isConversationMessageCreatedEvent({
        ...event,
        aggregateId: "99999999-9999-4999-8999-999999999999",
      }),
    ).toBe(false);
    expect(
      isConversationMessageCreatedEvent({ ...event, aggregateVersion: 3 }),
    ).toBe(false);
    expect(
      isConversationMessageCreatedEvent({ ...event, version: 2 }),
    ).toBe(false);
  });
});
