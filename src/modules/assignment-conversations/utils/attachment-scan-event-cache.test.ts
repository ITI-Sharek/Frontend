import { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { assignmentConversationKeys } from "../api/query-keys";
import type {
  ChatAttachmentDto,
  CursorPage,
  MessageDto,
} from "../types/assignment-conversation.types";
import { applyAttachmentScanEventToCache } from "./attachment-scan-event-cache";

const CONVERSATION_ID = "55555555-5555-4555-8555-555555555555";
const MESSAGE_ID = "66666666-6666-4666-8666-666666666666";
const ATTACHMENT_ID = "33333333-3333-4333-8333-333333333333";

function attachment(
  overrides: Partial<ChatAttachmentDto> = {},
): ChatAttachmentDto {
  return {
    attachmentId: ATTACHMENT_ID,
    filename: "report.pdf",
    byteSize: 1_024,
    mimeType: "application/pdf",
    caption: null,
    scanState: "scanning",
    eventVersion: 0,
    ...overrides,
  };
}

function message(overrides: Partial<MessageDto> = {}): MessageDto {
  return {
    messageId: MESSAGE_ID,
    conversationId: CONVERSATION_ID,
    sequence: 1,
    senderId: "22222222-2222-4222-8222-222222222222",
    senderName: "Contributor Name",
    body: "Here is the file",
    replyToMessageId: null,
    createdAt: "2026-08-09T12:01:00.000Z",
    editedAt: null,
    retractedAt: null,
    attachments: [attachment()],
    ...overrides,
  };
}

function scanEvent(aggregateVersion: number, overrides: Record<string, unknown> = {}) {
  return {
    eventId: "88888888-8888-4888-8888-888888888888",
    type: "attachment.scan_state_changed",
    version: 1,
    occurredAt: "2026-08-09T12:03:00.000Z",
    aggregateId: ATTACHMENT_ID,
    aggregateVersion,
    payload: {
      attachmentId: ATTACHMENT_ID,
      messageId: MESSAGE_ID,
      filename: "report.pdf",
      byteSize: 1_024,
      mimeType: "application/pdf",
      caption: null,
      scanState: "ready",
      ...overrides,
    },
  };
}

describe("attachment scan realtime cache convergence", () => {
  it("patches the matching attachment inside the cached message and ignores duplicate delivery by stable event ID", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [{ items: [message()], nextCursor: null }],
      pageParams: [undefined],
    });
    const recentEventIds = new RecentEventIds();

    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(1),
        recentEventIds,
      ),
    ).toBe("patched");
    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(1),
        recentEventIds,
      ),
    ).toBe("ignored");

    const patchedAttachments = queryClient
      .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
      ?.pages[0]?.items[0]?.attachments;
    expect(patchedAttachments).toEqual([
      attachment({ scanState: "ready", eventVersion: 1 }),
    ]);
  });

  it("ignores a stale or duplicate event whose aggregateVersion is not newer than the cached eventVersion, even under a fresh event ID", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [
        {
          items: [
            message({
              attachments: [
                attachment({ scanState: "ready", eventVersion: 3 }),
              ],
            }),
          ],
          nextCursor: null,
        },
      ],
      pageParams: [undefined],
    });

    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(3, { scanState: "blocked" }),
        new RecentEventIds(),
      ),
    ).toBe("ignored");
    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(2, { scanState: "blocked" }),
        new RecentEventIds(),
      ),
    ).toBe("ignored");

    // Out-of-order/duplicate redelivery never overwrote the newer cached
    // state with an older one.
    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items[0]?.attachments,
    ).toEqual([attachment({ scanState: "ready", eventVersion: 3 })]);
  });

  it("invalidates HTTP authority instead of guessing when the message is not in any cached page", () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(1),
        new RecentEventIds(),
      ),
    ).toBe("reconcile");
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: assignmentConversationKeys.messageLists(),
    });
  });

  it("invalidates instead of inventing an attachment when the cached message does not carry it", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [
        { items: [message({ attachments: [] })], nextCursor: null },
      ],
      pageParams: [undefined],
    });

    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        scanEvent(1),
        new RecentEventIds(),
      ),
    ).toBe("reconcile");
  });

  it("rejects a malformed event without touching the cache", () => {
    const queryClient = new QueryClient();
    const key = assignmentConversationKeys.messages(CONVERSATION_ID);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [{ items: [message()], nextCursor: null }],
      pageParams: [undefined],
    });

    expect(
      applyAttachmentScanEventToCache(
        queryClient,
        { not: "an event" },
        new RecentEventIds(),
      ),
    ).toBe("invalid");
    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items[0]?.attachments,
    ).toEqual([attachment()]);
  });
});
