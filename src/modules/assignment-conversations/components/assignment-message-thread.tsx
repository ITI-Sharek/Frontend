import { Search, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

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
import type {
  AssignmentConversationDto,
  MessageDto,
} from "../types/assignment-conversation.types";

const MAX_MESSAGE_LENGTH = 4_000;

export function AssignmentMessageThread({
  conversation,
  currentUserId,
  messageQuery,
  onMessageQueryChange,
  messagesQuery,
  sendMutation,
}: {
  conversation: AssignmentConversationDto;
  currentUserId?: string;
  messageQuery: string;
  onMessageQueryChange: (query: string) => void;
  messagesQuery: ReturnType<typeof useAssignmentMessagesQuery>;
  sendMutation: ReturnType<typeof useSendAssignmentMessageMutation>;
}) {
  const { t } = useTranslation();

  return (
    <section
      className="flex min-h-[32rem] min-w-0 flex-col"
      aria-label={t("assignmentConversations.thread.ariaLabel")}
    >
      <ConversationHeader conversation={conversation} />
      <MessageSearch value={messageQuery} onChange={onMessageQueryChange} />
      <MessageHistory query={messagesQuery} currentUserId={currentUserId} />
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
}: {
  conversation: AssignmentConversationDto;
}) {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border p-4">
      <h2 className="text-base font-bold text-foreground">
        {conversation.ownerName} ↔ {conversation.contributorName}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {conversation.status === "active"
          ? t("assignmentConversations.thread.activeDescription")
          : t("assignmentConversations.thread.readOnlyDescription")}
      </p>
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
  query,
  currentUserId,
}: {
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

function MessageBubble({ message, isOwn }: { message: MessageDto; isOwn: boolean }) {
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
      <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
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
  const bodyLength = [...body].length;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || disabled || mutation.isPending) return;
    mutation.mutate(
      {
        conversationId,
        idempotencyKey: globalThis.crypto.randomUUID(),
        body: trimmed,
      },
      { onSuccess: () => setBody("") },
    );
  }

  return (
    <form onSubmit={submit} className="border-t border-border p-4">
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
          disabled={disabled || mutation.isPending || body.trim().length === 0}
          aria-label={t("assignmentConversations.composer.sendAria")}
        >
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {getApiErrorMessage(
            mutation.error,
            t("assignmentConversations.composer.sendError"),
          )}
        </p>
      )}
      <p className="mt-2 text-end text-[11px] text-muted-foreground">
        {bodyLength}/{MAX_MESSAGE_LENGTH}
      </p>
    </form>
  );
}
