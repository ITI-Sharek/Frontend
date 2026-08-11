import { MessageCircle, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import {
  useAssignmentConversationQuery,
  useAssignmentConversationsQuery,
  useAssignmentMessagesQuery,
} from "../api/queries/use-assignment-conversation-queries";
import { useSendAssignmentMessageMutation } from "../api/mutations/use-assignment-conversation-mutations";
import { AssignmentConversationList } from "./assignment-conversation-list";
import { AssignmentMessageThread } from "./assignment-message-thread";

export function AssignmentConversationWorkspace({
  selectedConversationId,
  currentUserId,
  onSelectConversation,
}: {
  selectedConversationId?: string;
  currentUserId?: string;
  onSelectConversation: (conversationId: string) => void;
}) {
  const [messageQuery, setMessageQuery] = useState("");
  const conversationsQuery = useAssignmentConversationsQuery();
  const selectedConversationQuery = useAssignmentConversationQuery(
    selectedConversationId ?? "",
  );
  const conversations = useMemo(
    () =>
      conversationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [conversationsQuery.data],
  );
  const selectedFromList = conversations.find(
    (conversation) =>
      conversation.conversationId === selectedConversationId,
  );
  const activeConversation = selectedConversationId
    ? (selectedFromList ?? selectedConversationQuery.data ?? null)
    : (conversations.at(0) ?? null);
  const visibleConversations = useMemo(() => {
    if (!activeConversation) return conversations;
    if (
      conversations.some(
        (conversation) =>
          conversation.conversationId === activeConversation.conversationId,
      )
    ) {
      return conversations;
    }
    return [activeConversation, ...conversations];
  }, [activeConversation, conversations]);
  const conversationId = activeConversation?.conversationId ?? "";
  const messagesQuery = useAssignmentMessagesQuery(conversationId, messageQuery);
  const sendMutation = useSendAssignmentMessageMutation();

  useEffect(() => {
    if (!selectedConversationId && conversationId) {
      onSelectConversation(conversationId);
    }
  }, [conversationId, onSelectConversation, selectedConversationId]);

  if (conversationsQuery.isLoading) {
    return <WorkspaceState title="جارٍ تحميل المحادثات…" />;
  }

  if (conversationsQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={WifiOff}
          title="تعذّر تحميل المحادثات"
          description="تحقق من الاتصال ثم أعد المحاولة. لا تظهر المحادثات إلا للمشاركين في Assignment."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void conversationsQuery.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              إعادة المحاولة
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (
    selectedConversationId &&
    !selectedFromList &&
    selectedConversationQuery.isLoading
  ) {
    return <WorkspaceState title="جارٍ فتح المحادثة…" />;
  }

  if (
    selectedConversationId &&
    !selectedFromList &&
    selectedConversationQuery.isError
  ) {
    return (
      <PageContainer>
        <PageFeedback
          icon={MessageCircle}
          title="المحادثة غير متاحة"
          description="قد تكون المحادثة غير موجودة أو لم تعد مخولًا للوصول إليها."
        />
      </PageContainer>
    );
  }

  if (!activeConversation) {
    return (
      <PageContainer>
        <PageHeader
          title="المحادثات"
          description="محادثات خاصة بين مالك المشروع والمساهم المعيّن بعد قبول Assignment."
        />
        <PageFeedback
          className="mt-6"
          icon={MessageCircle}
          title="لا توجد محادثات بعد"
          description="ستظهر هنا المحادثة الخاصة عند قبول طلب مساهمة وإنشاء Assignment."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="المحادثات"
        description="تواصل مباشرة مع الطرف الآخر في Assignments الخاصة بك."
      />

      <div className="mt-6 grid min-h-[32rem] overflow-hidden rounded-card border border-border bg-card lg:grid-cols-[18rem_minmax(0,1fr)]">
        <AssignmentConversationList
          conversations={visibleConversations}
          selectedConversationId={conversationId}
          onSelect={onSelectConversation}
          hasNextPage={conversationsQuery.hasNextPage}
          isFetchingNextPage={conversationsQuery.isFetchingNextPage}
          onLoadMore={() => void conversationsQuery.fetchNextPage()}
        />
        <AssignmentMessageThread
          conversation={activeConversation}
          currentUserId={currentUserId}
          messageQuery={messageQuery}
          onMessageQueryChange={setMessageQuery}
          messagesQuery={messagesQuery}
          sendMutation={sendMutation}
        />
      </div>
    </PageContainer>
  );
}

function WorkspaceState({ title }: { title: string }) {
  return (
    <div
      className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {title}
    </div>
  );
}
