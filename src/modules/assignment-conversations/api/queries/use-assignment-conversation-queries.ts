import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getAssignmentConversation,
  listAssignmentConversations,
  listAssignmentMessages,
} from "../../services/assignment-conversations.service";
import { assignmentConversationKeys } from "../query-keys";

export function useAssignmentConversationsQuery() {
  return useInfiniteQuery({
    queryKey: assignmentConversationKeys.list(),
    queryFn: ({ pageParam }) =>
      listAssignmentConversations({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useAssignmentConversationQuery(conversationId: string) {
  return useQuery({
    queryKey: assignmentConversationKeys.detail(conversationId),
    queryFn: () => getAssignmentConversation(conversationId),
    enabled: conversationId.length > 0,
  });
}

export function useAssignmentMessagesQuery(
  conversationId: string,
  query = "",
) {
  return useInfiniteQuery({
    queryKey: assignmentConversationKeys.messages(conversationId, query),
    queryFn: ({ pageParam }) =>
      listAssignmentMessages(conversationId, {
        cursor: pageParam,
        ...(query ? { query } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: conversationId.length > 0,
  });
}
