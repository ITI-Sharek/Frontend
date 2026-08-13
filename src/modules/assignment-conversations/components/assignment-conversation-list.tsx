import type { AssignmentConversationDto } from "../types/assignment-conversation.types";

export function AssignmentConversationList({
  conversations,
  selectedConversationId,
  onSelect,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  conversations: AssignmentConversationDto[];
  selectedConversationId: string;
  onSelect: (conversationId: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <aside
      className="border-b border-border lg:border-b-0 lg:border-e"
      aria-label="قائمة المحادثات"
    >
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-bold text-foreground">Assignments</h2>
        <p className="mt-1 text-xs text-muted-foreground">محادثاتك الخاصة</p>
      </div>
      <div className="flex max-h-56 overflow-x-auto lg:max-h-[28rem] lg:flex-col lg:overflow-y-auto">
        {conversations.map((conversation) => {
          const selected =
            conversation.conversationId === selectedConversationId;
          return (
            <button
              key={conversation.conversationId}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(conversation.conversationId)}
              className={`min-w-52 flex-1 border-b border-border p-4 text-start transition-colors hover:bg-primary/[0.04] lg:min-w-0 ${selected ? "bg-primary/[0.08]" : ""}`}
            >
              <span className="block text-sm font-semibold text-foreground">
                {conversation.ownerName} ↔ {conversation.contributorName}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {conversation.status === "active" ? "مفتوحة" : "للقراءة فقط"}
              </span>
            </button>
          );
        })}
      </div>
      {hasNextPage && (
        <button
          type="button"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
          className="min-h-10 w-full border-t border-border px-3 text-xs font-semibold text-foreground hover:bg-primary/[0.04] disabled:opacity-60"
        >
          {isFetchingNextPage ? "جارٍ التحميل…" : "تحميل محادثات أقدم"}
        </button>
      )}
    </aside>
  );
}
