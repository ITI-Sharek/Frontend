import { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { assignmentConversationKeys } from "../api/query-keys";
import type {
  CursorPage,
  MessageDto,
} from "../types/assignment-conversation.types";
import { applyConversationMessageEventToCache } from "./conversation-message-event-cache";

const CONVERSATION_ID = "55555555-5555-4555-8555-555555555555";

function message(sequence: number): MessageDto {
  return {
    messageId:
      sequence === 1
        ? "66666666-6666-4666-8666-666666666666"
        : "77777777-7777-4777-8777-777777777777",
    conversationId: CONVERSATION_ID,
    sequence,
    senderId: "22222222-2222-4222-8222-222222222222",
    senderName: "Contributor Name",
    body: `Message ${sequence}`,
    replyToMessageId: null,
    createdAt: `2026-08-09T12:0${sequence}:00.000Z`,
    editedAt: null,
    retractedAt: null,
    attachments: [],
  };
}

function createdEvent(sequence: number) {
  return {
    eventId: "88888888-8888-4888-8888-888888888888",
    type: "conversation.message.created",
    version: 1,
    occurredAt: "2026-08-09T12:03:00.000Z",
    aggregateId: CONVERSATION_ID,
    aggregateVersion: sequence,
    payload: { message: message(sequence) },
  };
}

describe("conversation Message realtime cache convergence", () => {
  it("prepends one contiguous Message and ignores duplicate delivery by stable event ID", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [{ items: [message(1)], nextCursor: null }],
      pageParams: [undefined],
    });
    const recentEventIds = new RecentEventIds();

    expect(
      applyConversationMessageEventToCache(
        queryClient,
        createdEvent(2),
        recentEventIds,
      ),
    ).toBe("patched");
    expect(
      applyConversationMessageEventToCache(
        queryClient,
        createdEvent(2),
        recentEventIds,
      ),
    ).toBe("ignored");

    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items.map((item) => item.sequence),
    ).toEqual([2, 1]);
  });

  it("invalidates HTTP authority instead of inventing a missing sequence", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [{ items: [message(1)], nextCursor: null }],
      pageParams: [undefined],
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    expect(
      applyConversationMessageEventToCache(
        queryClient,
        createdEvent(3),
        new RecentEventIds(),
      ),
    ).toBe("reconcile");
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: assignmentConversationKeys.conversationMessages(
        CONVERSATION_ID,
      ),
    });
    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items.map((item) => item.sequence),
    ).toEqual([1]);
  });

  it("reconciles cached search results even when unfiltered history patches contiguously", () => {
    const queryClient = new QueryClient();
    const historyKey = assignmentConversationKeys.messages(CONVERSATION_ID);
    const searchKey = assignmentConversationKeys.messages(
      CONVERSATION_ID,
      "Message",
    );
    const cached = {
      pages: [{ items: [message(1)], nextCursor: null }],
      pageParams: [undefined],
    } satisfies InfiniteData<CursorPage<MessageDto>>;
    queryClient.setQueryData(historyKey, cached);
    queryClient.setQueryData(searchKey, cached);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    expect(
      applyConversationMessageEventToCache(
        queryClient,
        createdEvent(2),
        new RecentEventIds(),
      ),
    ).toBe("reconcile");
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: assignmentConversationKeys.conversationMessages(
        CONVERSATION_ID,
      ),
    });
    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(historyKey)
        ?.pages[0]?.items.map((item) => item.sequence),
    ).toEqual([2, 1]);
  });
});
