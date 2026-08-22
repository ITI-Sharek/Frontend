import { MessageCircle, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
import type { AssignmentConversationDto } from "../types/assignment-conversation.types";
import { AssignmentConversationList } from "./assignment-conversation-list";
import { AssignmentMessageThread } from "./assignment-message-thread";

export function AssignmentConversationWorkspace({
  selectedConversationId,
  currentUserId,
  onSelectConversation,
  renderCallAction,
}: {
  selectedConversationId?: string;
  currentUserId?: string;
  onSelectConversation: (conversationId: string) => void;
  /**
   * Composed by the route -- lets it inject the call-launch affordance
   * (owned by `modules/assignment-calls`) into the thread header without
   * this module ever importing that module directly (CLAUDE.md).
   */
  renderCallAction?: (conversation: AssignmentConversationDto) => React.ReactNode;
}) {
  const { t } = useTranslation();
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
    return <WorkspaceState title={t("assignmentConversations.workspace.loading")} />;
  }

  if (conversationsQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={WifiOff}
          title={t("assignmentConversations.workspace.loadErrorTitle")}
          description={t("assignmentConversations.workspace.loadErrorDescription")}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => void conversationsQuery.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              {t("common.retry")}
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
    return <WorkspaceState title={t("assignmentConversations.workspace.opening")} />;
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
          title={t("assignmentConversations.workspace.unavailableTitle")}
          description={t("assignmentConversations.workspace.unavailableDescription")}
        />
      </PageContainer>
    );
  }

  if (!activeConversation) {
    return (
      <PageContainer>
        <PageHeader
          title={t("assignmentConversations.workspace.title")}
          description={t("assignmentConversations.workspace.emptyIntro")}
        />
        <PageFeedback
          className="mt-6"
          icon={MessageCircle}
          title={t("assignmentConversations.workspace.emptyTitle")}
          description={t("assignmentConversations.workspace.emptyDescription")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("assignmentConversations.workspace.title")}
        description={t("assignmentConversations.workspace.description")}
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
          headerAction={renderCallAction?.(activeConversation)}
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
