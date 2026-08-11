import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AssignmentConversationDto,
  ConversationListParams,
  CursorPage,
  MessageDto,
  MessageListParams,
  SendMessagePayload,
} from "../types/assignment-conversation.types";

export async function listAssignmentConversations(
  params: ConversationListParams = {},
): Promise<CursorPage<AssignmentConversationDto>> {
  const { data } = await axiosInstance.get<CursorPage<AssignmentConversationDto>>(
    "/assignment-conversations",
    { params },
  );
  return data;
}

export async function getAssignmentConversation(
  conversationId: string,
): Promise<AssignmentConversationDto> {
  const { data } = await axiosInstance.get<AssignmentConversationDto>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}`,
  );
  return data;
}

export async function listAssignmentMessages(
  conversationId: string,
  params: MessageListParams = {},
): Promise<CursorPage<MessageDto>> {
  const { data } = await axiosInstance.get<CursorPage<MessageDto>>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}/messages`,
    { params },
  );
  return data;
}

export async function sendAssignmentMessage({
  conversationId,
  idempotencyKey,
  body,
}: SendMessagePayload): Promise<MessageDto> {
  const { data } = await axiosInstance.post<MessageDto>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}/messages`,
    { idempotencyKey, body },
  );
  return data;
}
