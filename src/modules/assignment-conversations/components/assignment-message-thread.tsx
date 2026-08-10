import { Search, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";

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
  return (
    <section
      className="flex min-h-[32rem] min-w-0 flex-col"
      aria-label="محادثة Assignment"
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
  return (
    <header className="border-b border-border p-4">
      <h2 className="text-base font-bold text-foreground">
        {conversation.ownerName} ↔ {conversation.contributorName}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {conversation.status === "active"
          ? "المحادثة متاحة للطرفين"
          : "هذه المحادثة محفوظة للقراءة فقط"}
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
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Search className="size-4 text-muted-foreground" aria-hidden="true" />
      <label className="sr-only" htmlFor="message-search">
        البحث في الرسائل
      </label>
      <input
        id="message-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ابحث داخل رسائل المحادثة…"
        className="min-h-10 w-full rounded-input border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
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
  if (query.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        جارٍ تحميل الرسائل…
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        role="alert"
        className="flex flex-1 items-center justify-center p-6 text-sm text-destructive"
      >
        تعذّر تحميل رسائل المحادثة.
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
          {query.isFetchingNextPage ? "جارٍ التحميل…" : "تحميل رسائل أقدم"}
        </Button>
      )}
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          ابدأ أول رسالة في هذه المحادثة.
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
  return (
    <li
      data-sender={isOwn ? "own" : "other"}
      aria-label={`رسالة من ${message.senderName}`}
      className={`max-w-[90%] rounded-card border p-3 text-sm text-foreground ${isOwn ? "self-end border-primary/30 bg-primary/[0.08]" : "self-start border-border bg-background"}`}
    >
      <p className="mb-1 text-xs font-semibold text-muted-foreground">
        {isOwn ? "أنت" : message.senderName}
      </p>
      <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
      <time
        className="mt-2 block text-[11px] text-muted-foreground"
        dateTime={message.createdAt}
      >
        {new Date(message.createdAt).toLocaleString("ar-EG", {
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
        نص الرسالة
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="assignment-message-body"
          value={body}
          onChange={(event) =>
            setBody([...event.target.value].slice(0, MAX_MESSAGE_LENGTH).join(""))
          }
          placeholder={disabled ? "المحادثة للقراءة فقط" : "اكتب رسالتك…"}
          disabled={disabled || mutation.isPending}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH * 2}
          className="min-h-11 flex-1 resize-y rounded-input border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || mutation.isPending || body.trim().length === 0}
          aria-label="إرسال الرسالة"
        >
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {getApiErrorMessage(mutation.error, "تعذّر إرسال الرسالة.")}
        </p>
      )}
      <p className="mt-2 text-end text-[11px] text-muted-foreground">
        {bodyLength}/{MAX_MESSAGE_LENGTH}
      </p>
    </form>
  );
}
