import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AssignmentCallDto,
  JoinCredentialsDto,
  StartOrAnswerCallResponseDto,
} from "../types/assignment-call.types";

export async function startAssignmentCall({
  conversationId,
  idempotencyKey,
}: {
  conversationId: string;
  idempotencyKey: string;
}): Promise<StartOrAnswerCallResponseDto> {
  const { data } = await axiosInstance.post<StartOrAnswerCallResponseDto>(
    `/assignment-conversations/${encodeURIComponent(conversationId)}/calls`,
    { idempotencyKey },
  );
  return data;
}

export async function answerAssignmentCall({
  callId,
  idempotencyKey,
}: {
  callId: string;
  idempotencyKey: string;
}): Promise<StartOrAnswerCallResponseDto> {
  const { data } = await axiosInstance.post<StartOrAnswerCallResponseDto>(
    `/assignment-calls/${encodeURIComponent(callId)}/answer`,
    { idempotencyKey },
  );
  return data;
}

export async function declineAssignmentCall({
  callId,
  idempotencyKey,
}: {
  callId: string;
  idempotencyKey: string;
}): Promise<AssignmentCallDto> {
  const { data } = await axiosInstance.post<AssignmentCallDto>(
    `/assignment-calls/${encodeURIComponent(callId)}/decline`,
    { idempotencyKey },
  );
  return data;
}

export async function endAssignmentCall({
  callId,
  idempotencyKey,
}: {
  callId: string;
  idempotencyKey: string;
}): Promise<AssignmentCallDto> {
  const { data } = await axiosInstance.post<AssignmentCallDto>(
    `/assignment-calls/${encodeURIComponent(callId)}/end`,
    { idempotencyKey },
  );
  return data;
}

/**
 * `idempotencyKey` is still part of the wire contract for consistency with
 * every other call command, but the server does not use it for replay
 * detection on this endpoint -- a fresh one is generated per call anyway.
 */
export async function reconnectAssignmentCall({
  callId,
  idempotencyKey,
}: {
  callId: string;
  idempotencyKey: string;
}): Promise<StartOrAnswerCallResponseDto> {
  const { data } = await axiosInstance.post<StartOrAnswerCallResponseDto>(
    `/assignment-calls/${encodeURIComponent(callId)}/reconnect`,
    { idempotencyKey },
  );
  return data;
}

export async function getJoinCredentials(callId: string): Promise<JoinCredentialsDto> {
  const { data } = await axiosInstance.get<JoinCredentialsDto>(
    `/assignment-calls/${encodeURIComponent(callId)}/join-credentials`,
  );
  return data;
}
