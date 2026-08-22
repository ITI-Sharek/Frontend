import { Loader2, Paperclip, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { useCreateAttachmentUploadMutation } from "../api/mutations/use-assignment-conversation-mutations";
import { useChatAttachmentUploadConstraintsQuery } from "../api/queries/use-assignment-conversation-queries";
import { getChatAttachmentErrorMessage } from "../constants/attachment-copy";
import { createChatAttachmentIdempotencyKey } from "../utils/attachment-idempotency";
import { formatAttachmentByteSize } from "../utils/attachment-format";

/** Used only while `/chat-attachment-upload-constraints` has not resolved yet. */
const FALLBACK_MAX_ATTACHMENTS = 5;

export interface PendingChatAttachment {
  localId: string;
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
  uploadId: string | null;
  errorMessage: string | null;
}

export function MessageAttachmentPicker({
  conversationId,
  disabled,
  attachments,
  onAttachmentsChange,
}: {
  conversationId: string;
  disabled: boolean;
  attachments: PendingChatAttachment[];
  onAttachmentsChange: (
    updater: (prev: PendingChatAttachment[]) => PendingChatAttachment[],
  ) => void;
}) {
  const { t, i18n } = useTranslation();
  const constraintsQuery = useChatAttachmentUploadConstraintsQuery();
  const uploadMutation = useCreateAttachmentUploadMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [pickError, setPickError] = useState<string | null>(null);

  const constraints = constraintsQuery.data;
  const maxCount = constraints?.maxPerMessage ?? FALLBACK_MAX_ATTACHMENTS;
  const atLimit = attachments.length >= maxCount;

  /**
   * Client-side checks mirror the server's and never replace them. They
   * exist to spare an upload that was always going to be refused; the server
   * remains the only authority on what is accepted. Mirrors
   * `MaterialUploadForm`'s `validate()`.
   */
  function validate(file: File): string | null {
    if (!constraints) return null;
    if (file.size > constraints.maxBytes) {
      return t("assignmentConversations.attachments.errors.tooLargeWithLimit", {
        maxBytes: formatAttachmentByteSize(i18n.language, constraints.maxBytes),
      });
    }
    if (file.type !== "" && !constraints.allowedMimeTypes.includes(file.type)) {
      return t("assignmentConversations.attachments.errors.typeUnsupported");
    }
    return null;
  }

  function startUpload(localId: string, file: File) {
    uploadMutation.mutate(
      {
        conversationId,
        file,
        idempotencyKey: createChatAttachmentIdempotencyKey(),
        onUploadProgress: (progress) => {
          onAttachmentsChange((prev) =>
            prev.map((item) =>
              item.localId === localId ? { ...item, progress } : item,
            ),
          );
        },
      },
      {
        onSuccess: (result) => {
          onAttachmentsChange((prev) =>
            prev.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    status: "uploaded",
                    progress: 100,
                    uploadId: result.uploadId,
                  }
                : item,
            ),
          );
        },
        onError: (error) => {
          onAttachmentsChange((prev) =>
            prev.map((item) =>
              item.localId === localId
                ? {
                    ...item,
                    status: "error",
                    errorMessage: getChatAttachmentErrorMessage(t, error),
                  }
                : item,
            ),
          );
        },
      },
    );
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = [...fileList];
    const availableSlots = Math.max(0, maxCount - attachments.length);

    setPickError(
      files.length > availableSlots
        ? t("assignmentConversations.attachments.errors.limitExceeded", {
            maxCount,
          })
        : null,
    );

    for (const file of files.slice(0, availableSlots)) {
      const localId = globalThis.crypto.randomUUID();
      const localError = validate(file);

      onAttachmentsChange((prev) => [
        ...prev,
        {
          localId,
          file,
          status: localError ? "error" : "uploading",
          progress: 0,
          uploadId: null,
          errorMessage: localError,
        },
      ]);

      if (!localError) startUpload(localId, file);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAttachment(localId: string) {
    onAttachmentsChange((prev) =>
      prev.filter((item) => item.localId !== localId),
    );
  }

  return (
    <div className="mb-2">
      <label className="sr-only" htmlFor={inputId}>
        {t("assignmentConversations.attachments.addButton")}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={constraints?.allowedMimeTypes.join(",")}
        disabled={disabled || atLimit}
        onChange={(event) => handleFilesSelected(event.target.files)}
        className="sr-only"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || atLimit}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4" aria-hidden="true" />
          {t("assignmentConversations.attachments.addButton")}
        </Button>
        {attachments.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {t("assignmentConversations.attachments.countLabel", {
              count: attachments.length,
              max: maxCount,
            })}
          </span>
        )}
      </div>

      {pickError && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {pickError}
        </p>
      )}

      {attachments.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {attachments.map((item) => (
            <li
              key={item.localId}
              className="flex items-center gap-2 rounded-input border border-border bg-surface-fog px-2.5 py-1.5 text-xs"
            >
              {item.status === "uploading" && (
                <Loader2
                  className="size-3.5 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
              {item.status === "uploading" && (
                <span className="shrink-0 text-muted-foreground">
                  {t("assignmentConversations.attachments.uploadingProgress", {
                    progress: item.progress,
                  })}
                </span>
              )}
              {item.status === "error" && item.errorMessage && (
                <span role="alert" className="shrink-0 text-destructive">
                  {item.errorMessage}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("assignmentConversations.attachments.removeAria", {
                  filename: item.file.name,
                })}
                onClick={() => removeAttachment(item.localId)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
