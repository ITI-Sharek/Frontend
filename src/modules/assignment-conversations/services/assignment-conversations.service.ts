import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AssignmentConversationDto,
  AttachmentDownloadUrlDto,
  AttachmentDownloadUrlPayload,
  ChatAttachmentUploadConstraints,
  ChatAttachmentUploadDto,
  ConversationListParams,
  CreateAttachmentUploadPayload,
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
  attachmentUploadIds,
}: SendMessagePayload): Promise<MessageDto> {
  const { data } = await axiosInstance.post<MessageDto>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      idempotencyKey,
      body,
      ...(attachmentUploadIds && attachmentUploadIds.length > 0
        ? { attachmentUploadIds }
        : {}),
    },
  );
  return data;
}

/**
 * Multipart, so the Content-Type header must be left unset: the browser has to
 * add its own boundary parameter, and the axios instance's JSON default would
 * override it and make the body unparseable.
 */
function toAttachmentUploadFormData(
  payload: CreateAttachmentUploadPayload,
): FormData {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("idempotencyKey", payload.idempotencyKey);
  if (payload.caption !== undefined) form.append("caption", payload.caption);
  return form;
}

const MULTIPART_HEADERS = { "Content-Type": undefined } as const;

export async function createAttachmentUpload(
  payload: CreateAttachmentUploadPayload,
  options?: { onUploadProgress?: (percent: number) => void },
): Promise<ChatAttachmentUploadDto> {
  const { data } = await axiosInstance.post<ChatAttachmentUploadDto>(
    `/assignment-conversations/${encodeURIComponent(payload.conversationId)}/attachment-uploads`,
    toAttachmentUploadFormData(payload),
    {
      headers: MULTIPART_HEADERS,
      onUploadProgress: options?.onUploadProgress
        ? (progressEvent) => {
            const total = progressEvent.total ?? payload.file.size;
            if (total <= 0) return;
            options.onUploadProgress?.(
              Math.round((progressEvent.loaded / total) * 100),
            );
          }
        : undefined,
    },
  );
  return data;
}

export async function createAttachmentDownloadUrl({
  conversationId,
  attachmentId,
}: AttachmentDownloadUrlPayload): Promise<AttachmentDownloadUrlDto> {
  const { data } = await axiosInstance.post<AttachmentDownloadUrlDto>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
  );
  return data;
}

export async function getAttachmentUploadConstraints(): Promise<ChatAttachmentUploadConstraints> {
  const { data } = await axiosInstance.get<ChatAttachmentUploadConstraints>(
    "/chat-attachment-upload-constraints",
  );
  return data;
}
