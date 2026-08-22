import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAttachmentDownloadUrl,
  createAttachmentUpload,
  sendAssignmentMessage,
} from "../../services/assignment-conversations.service";
import type { CreateAttachmentUploadPayload } from "../../types/assignment-conversation.types";
import { assignmentConversationKeys } from "../query-keys";

export function useSendAssignmentMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendAssignmentMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: assignmentConversationKeys.messageLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: assignmentConversationKeys.list(),
      });
    },
  });
}

/**
 * Starts scanning before the message ever exists: upload is its own command,
 * separate from send. The optional progress callback rides along with the
 * mutation variables rather than the service payload, since it is transport
 * plumbing for the picker's per-file progress bar, not part of the command.
 */
export function useCreateAttachmentUploadMutation() {
  return useMutation({
    mutationFn: ({
      onUploadProgress,
      ...payload
    }: CreateAttachmentUploadPayload & {
      onUploadProgress?: (percent: number) => void;
    }) => createAttachmentUpload(payload, { onUploadProgress }),
  });
}

/**
 * `gcTime: 0` so a minted download URL is never kept around past its TTL —
 * every download press mints a fresh one instead of risking a stale/expired
 * URL served back from the mutation cache.
 */
export function useAttachmentDownloadUrlMutation() {
  return useMutation({
    mutationFn: createAttachmentDownloadUrl,
    gcTime: 0,
  });
}
