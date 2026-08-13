import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { assignmentConversationKeys } from "../api/query-keys";
import type {
  CursorPage,
  MessageDto,
} from "../types/assignment-conversation.types";
import { isConversationMessageCreatedEvent } from "./conversation-message-event";

type MessageInfiniteData = InfiniteData<
  CursorPage<MessageDto>,
  string | undefined
>;

export type ConversationMessageCacheOutcome =
  | "patched"
  | "ignored"
  | "reconcile"
  | "invalid";

export function applyConversationMessageEventToCache(
  queryClient: QueryClient,
  value: unknown,
  recentEventIds: RecentEventIds,
): ConversationMessageCacheOutcome {
  if (!isConversationMessageCreatedEvent(value)) return "invalid";
  if (recentEventIds.hasOrAdd(value.eventId)) return "ignored";

  let patched = false;
  let ignored = false;
  let needsReconcile = false;
  let hasCachedList = false;
  const cachedLists = queryClient.getQueriesData<MessageInfiniteData>({
    queryKey: assignmentConversationKeys.conversationMessages(
      value.aggregateId,
    ),
  });

  for (const [queryKey, data] of cachedLists) {
    if (!data) continue;
    hasCachedList = true;
    const searchQuery = queryKey[3];
    if (typeof searchQuery === "string" && searchQuery.length > 0) {
      needsReconcile = true;
      continue;
    }

    const messages = data.pages.flatMap((page) => page.items);
    if (
      messages.some(
        (message) => message.messageId === value.payload.message.messageId,
      )
    ) {
      ignored = true;
      continue;
    }

    const latestSequence = messages.reduce(
      (latest, message) => Math.max(latest, message.sequence),
      0,
    );
    if (value.aggregateVersion <= latestSequence) {
      ignored = true;
      continue;
    }
    if (value.aggregateVersion !== latestSequence + 1) {
      needsReconcile = true;
      continue;
    }

    queryClient.setQueryData<MessageInfiniteData>(queryKey, {
      ...data,
      pages: data.pages.map((page, index) =>
        index === 0
          ? {
              ...page,
              items: [value.payload.message, ...page.items],
            }
          : page,
      ),
    });
    patched = true;
  }

  if (!hasCachedList) needsReconcile = true;
  const outcome: ConversationMessageCacheOutcome = needsReconcile
    ? "reconcile"
    : patched
      ? "patched"
      : ignored
        ? "ignored"
        : "reconcile";

  void queryClient.invalidateQueries({
    queryKey: assignmentConversationKeys.list(),
  });
  if (outcome === "reconcile") {
    void queryClient.invalidateQueries({
      queryKey: assignmentConversationKeys.conversationMessages(
        value.aggregateId,
      ),
    });
  }

  return outcome;
}

export async function reconcileAssignmentConversationQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries(
      {
        queryKey: assignmentConversationKeys.list(),
        refetchType: "active",
      },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries(
      {
        queryKey: assignmentConversationKeys.messageLists(),
        refetchType: "active",
      },
      { throwOnError: true },
    ),
  ]);
}

export function clearAssignmentConversationQueries(
  queryClient: QueryClient,
): void {
  queryClient.removeQueries({ queryKey: assignmentConversationKeys.all });
}
