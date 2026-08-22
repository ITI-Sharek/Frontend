import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { assignmentConversationKeys } from "../api/query-keys";
import type {
  AttachmentScanStateChangedEvent,
  CursorPage,
  MessageDto,
} from "../types/assignment-conversation.types";
import { isAttachmentScanStateChangedEvent } from "./attachment-scan-event";

type MessageInfiniteData = InfiniteData<CursorPage<MessageDto>, string | undefined>;

export type AttachmentScanEventCacheOutcome =
  | "patched"
  | "ignored"
  | "reconcile"
  | "invalid";

/**
 * Returns the same `message` reference when nothing changes, and a new object
 * when the Attachment is patched — the identity difference is how callers
 * detect a change, so no mutable flag needs to cross into this closure.
 */
function patchMessageAttachment(
  message: MessageDto,
  event: AttachmentScanStateChangedEvent,
): MessageDto {
  if (message.messageId !== event.payload.messageId) return message;

  const attachmentIndex = message.attachments.findIndex(
    (attachment) => attachment.attachmentId === event.payload.attachmentId,
  );
  if (attachmentIndex === -1) return message;

  const current = message.attachments[attachmentIndex];
  if (event.aggregateVersion <= current.eventVersion) return message;

  const nextAttachments = [...message.attachments];
  nextAttachments[attachmentIndex] = {
    ...current,
    filename: event.payload.filename,
    byteSize: event.payload.byteSize,
    mimeType: event.payload.mimeType,
    caption: event.payload.caption,
    scanState: event.payload.scanState,
    eventVersion: event.aggregateVersion,
  };
  return { ...message, attachments: nextAttachments };
}

/**
 * Patches one Attachment inside whichever cached Message list already holds
 * its Message.
 *
 * Unlike `applyConversationMessageEventToCache`, this event's aggregate is
 * the attachment, not the conversation, so there is no `conversationId` to
 * key a targeted lookup with — every cached message list is searched for the
 * `messageId` the event names. The guard is a plain monotonic version check
 * (`aggregateVersion <= current eventVersion` is ignored) rather than the
 * sequence-contiguity the Message cache enforces: this is a per-attachment
 * counter, so there is no "next" value to insert, only a field to overwrite.
 *
 * If the Message never turns up in any cached list, that is not guessed at —
 * the caller falls back to the same reconcile mechanism the Message cache
 * uses for its own "not present" case.
 */
export function applyAttachmentScanEventToCache(
  queryClient: QueryClient,
  value: unknown,
  recentEventIds: RecentEventIds,
): AttachmentScanEventCacheOutcome {
  if (!isAttachmentScanStateChangedEvent(value)) return "invalid";
  if (recentEventIds.hasOrAdd(value.eventId)) return "ignored";

  const { attachmentId, messageId } = value.payload;
  const cachedLists = queryClient.getQueriesData<MessageInfiniteData>({
    queryKey: assignmentConversationKeys.messageLists(),
  });

  const allMessages = cachedLists.flatMap(([, data]) =>
    data ? data.pages.flatMap((page) => page.items) : [],
  );
  const messageFound = allMessages.some(
    (message) => message.messageId === messageId,
  );
  const attachmentFound = allMessages.some(
    (message) =>
      message.messageId === messageId &&
      message.attachments.some(
        (attachment) => attachment.attachmentId === attachmentId,
      ),
  );

  let patched = false;
  for (const [queryKey, data] of cachedLists) {
    if (!data) continue;

    const pages = data.pages.map((page) => {
      const items = page.items.map((message) =>
        patchMessageAttachment(message, value),
      );
      return items.some((item, index) => item !== page.items[index])
        ? { ...page, items }
        : page;
    });

    if (pages.some((page, index) => page !== data.pages[index])) {
      queryClient.setQueryData<MessageInfiniteData>(queryKey, {
        ...data,
        pages,
      });
      patched = true;
    }
  }

  // The Message not turning up anywhere, or turning up without the Attachment
  // it is supposed to already carry, both mean the cache disagrees with the
  // server's invariant — the fix is to refetch, never to invent a Message or
  // an Attachment locally.
  if (!messageFound || !attachmentFound) {
    void queryClient.invalidateQueries({
      queryKey: assignmentConversationKeys.messageLists(),
    });
    return "reconcile";
  }

  return patched ? "patched" : "ignored";
}
