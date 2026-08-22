import { Search, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Textarea } from "@/shared/components/ui/textarea";

import type { useSendAssignmentMessageMutation } from "../api/mutations/use-assignment-conversation-mutations";
import type { useAssignmentMessagesQuery } from "../api/queries/use-assignment-conversation-queries";
import { getChatAttachmentErrorMessage } from "../constants/attachment-copy";
import type {
  AssignmentConversationDto,
  MessageDto,
} from "../types/assignment-conversation.types";
import { MessageAttachmentList } from "./message-attachment-list";
import type { PendingChatAttachment } from "./message-attachment-picker";
import { MessageAttachmentPicker } from "./message-attachment-picker";

const MAX_MESSAGE_LENGTH = 4_000;

export function AssignmentMessageThread({
  conversation,
  currentUserId,
  messageQuery,
  onMessageQueryChange,
  messagesQuery,
  sendMutation,
  headerAction,
}: {
  conversation: AssignmentConversationDto;
  currentUserId?: string;
  messageQuery: string;
  onMessageQueryChange: (query: string) => void;
  messagesQuery: ReturnType<typeof useAssignmentMessagesQuery>;
  sendMutation: ReturnType<typeof useSendAssignmentMessageMutation>;
  /**
   * Composed by the route, not this module -- a module never imports
   * another module directly (CLAUDE.md). The route renders the call-launch
   * affordance (from `modules/assignment-calls`) and passes the resulting
   * element down here so this module stays free of any import from it.
   */
  headerAction?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <section
      className="flex min-h-[32rem] min-w-0 flex-col"
      aria-label={t("assignmentConversations.thread.ariaLabel")}
    >
      <ConversationHeader conversation={conversation} headerAction={headerAction} />
      <MessageSearch value={messageQuery} onChange={onMessageQueryChange} />
      <MessageHistory
        conversationId={conversation.conversationId}
        query={messagesQuery}
        currentUserId={currentUserId}
      />
      <MessageComposer
        conversationId={conversation.conversationId}
        disabled={conversation.status !== "active"}
        mutation={sendMutation}
      />
    </section>
  );
}

function ConversationHeader({
  conversation,
  headerAction,
}: {
  conversation: AssignmentConversationDto;
  headerAction?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <header className="flex items-start justify-between gap-3 border-b border-border p-4">
      <div>
        <h2 className="text-base font-bold text-foreground">
          {conversation.ownerName} ↔ {conversation.contributorName}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {conversation.status === "active"
            ? t("assignmentConversations.thread.activeDescription")
            : t("assignmentConversations.thread.readOnlyDescription")}
        </p>
      </div>
      {headerAction}
    </header>
  );
}

function MessageSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-border px-4 py-3">
      <label className="sr-only" htmlFor="message-search">
        {t("assignmentConversations.thread.searchLabel")}
      </label>
      <InputGroup>
        <InputGroupInput
          id="message-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("assignmentConversations.thread.searchPlaceholder")}
          className="text-sm"
        />
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function MessageHistory({
  conversationId,
  query,
  currentUserId,
}: {
  conversationId: string;
  query: ReturnType<typeof useAssignmentMessagesQuery>;
  currentUserId?: string;
}) {
  const { t } = useTranslation();

  if (query.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        {t("assignmentConversations.thread.loadingMessages")}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        role="alert"
        className="flex flex-1 items-center justify-center p-6 text-sm text-destructive"
      >
        {t("assignmentConversations.thread.loadError")}
      </div>
    );
  }
  const messages = [
    ...(query.data?.pages.flatMap((page) => page.items) ?? []),
  ].reverse();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {query.hasNextPage && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
          className="m-2 self-center"
        >
          {query.isFetchingNextPage
            ? t("common.loading_ellipsis")
            : t("assignmentConversations.thread.loadOlder")}
        </Button>
      )}
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {t("assignmentConversations.thread.empty")}
        </div>
      ) : (
        <ol
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
          aria-live="polite"
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.messageId}
              conversationId={conversationId}
              message={message}
              isOwn={
                currentUserId !== undefined &&
                message.senderId === currentUserId
              }
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function MessageBubble({
  conversationId,
  message,
  isOwn,
}: {
  conversationId: string;
  message: MessageDto;
  isOwn: boolean;
}) {
  const { i18n, t } = useTranslation();

  return (
    <li
      data-sender={isOwn ? "own" : "other"}
      aria-label={t("assignmentConversations.thread.messageFrom", {
        sender: message.senderName,
      })}
      className={`max-w-[90%] rounded-card border p-3 text-sm text-foreground ${isOwn ? "self-end border-primary/30 bg-primary/[0.08]" : "self-start border-border bg-background"}`}
    >
      <p className="mb-1 text-xs font-semibold text-muted-foreground">
        {isOwn ? t("assignmentConversations.thread.you") : message.senderName}
      </p>
      {message.body.length > 0 && (
        <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
      )}
      <MessageAttachmentList
        conversationId={conversationId}
        attachments={message.attachments}
      />
      <time
        className="mt-2 block text-[11px] text-muted-foreground"
        dateTime={message.createdAt}
      >
        {new Date(message.createdAt).toLocaleString(i18n.language, {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </time>
    </li>
  );
}

function MessageComposer({
  conversationId,
  disabled,
  mutation,
}: {
  conversationId: string;
  disabled: boolean;
  mutation: ReturnType<typeof useSendAssignmentMessageMutation>;
}) {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<PendingChatAttachment[]>([]);
  const bodyLength = [...body].length;

  const readyAttachmentIds = attachments
    .filter((item) => item.status === "uploaded" && item.uploadId !== null)
    .map((item) => item.uploadId as string);
  const hasUploadingAttachment = attachments.some(
    (item) => item.status === "uploading",
  );
  // Matches the server's own guard: `MESSAGE_BODY_REQUIRED` only fires when
  // both the body is empty/whitespace AND there is no attachment reference.
  const hasSendableContent = body.trim().length > 0 || readyAttachmentIds.length > 0;
  const canSubmit =
    !disabled && !mutation.isPending && !hasUploadingAttachment && hasSendableContent;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      {
        conversationId,
        idempotencyKey: globalThis.crypto.randomUUID(),
        body: body.trim(),
        attachmentUploadIds:
          readyAttachmentIds.length > 0 ? readyAttachmentIds : undefined,
      },
      {
        onSuccess: () => {
          setBody("");
          setAttachments([]);
        },
      },
    );
  }

  function composerErrorMessage(): string {
    const code = getApiErrorCode(mutation.error);
    if (code?.startsWith("CHAT_ATTACHMENT")) {
      return getChatAttachmentErrorMessage(t, mutation.error);
    }
    return getApiErrorMessage(
      mutation.error,
      t("assignmentConversations.composer.sendError"),
    );
  }

  return (
    <form onSubmit={submit} className="border-t border-border p-4">
      <MessageAttachmentPicker
        conversationId={conversationId}
        disabled={disabled || mutation.isPending}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />
      <label className="sr-only" htmlFor="assignment-message-body">
        {t("assignmentConversations.composer.label")}
      </label>
      <div className="flex items-end gap-2">
        <Textarea
          id="assignment-message-body"
          value={body}
          onChange={(event) =>
            setBody([...event.target.value].slice(0, MAX_MESSAGE_LENGTH).join(""))
          }
          placeholder={
            disabled
              ? t("assignmentConversations.composer.readOnlyPlaceholder")
              : t("assignmentConversations.composer.placeholder")
          }
          disabled={disabled || mutation.isPending}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH * 2}
          className="min-h-11 flex-1 resize-y bg-background"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSubmit}
          aria-label={t("assignmentConversations.composer.sendAria")}
        >
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {composerErrorMessage()}
        </p>
      )}
      <p className="mt-2 text-end text-[11px] text-muted-foreground">
        {bodyLength}/{MAX_MESSAGE_LENGTH}
      </p>
    </form>
  );
}
