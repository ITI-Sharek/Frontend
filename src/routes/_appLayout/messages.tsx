import { createFileRoute } from "@tanstack/react-router";

import { CallLaunchButton } from "@/modules/assignment-calls";
import { AssignmentConversationWorkspace } from "@/modules/assignment-conversations";
import type { AssignmentConversationDto } from "@/modules/assignment-conversations";
import { useCurrentUserQuery } from "@/modules/auth";

interface MessagesSearch {
  conversation?: string;
}

export const Route = createFileRoute("/_appLayout/messages")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): MessagesSearch =>
    typeof search.conversation === "string"
      ? { conversation: search.conversation }
      : {},
  component: MessagesPage,
});

function MessagesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { currentUser } = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(currentUser);
  const viewer = currentUser ?? currentUserQuery.data;

  return (
    <AssignmentConversationWorkspace
      selectedConversationId={search.conversation}
      currentUserId={viewer?.id}
      onSelectConversation={(conversationId) =>
        void navigate({ search: { conversation: conversationId } })
      }
      renderCallAction={
        viewer
          ? (conversation) => renderCallAction(conversation, viewer.id)
          : undefined
      }
    />
  );
}

/**
 * `assignment-conversations` never imports `assignment-calls` directly
 * (module isolation, CLAUDE.md); this route composes both, mapping the
 * conversation DTO to whichever participant is NOT the current viewer.
 */
function renderCallAction(
  conversation: AssignmentConversationDto,
  currentUserId: string,
) {
  const isOwner = conversation.ownerId === currentUserId;
  const calleeId = isOwner ? conversation.contributorId : conversation.ownerId;
  const calleeName = isOwner ? conversation.contributorName : conversation.ownerName;

  return (
    <CallLaunchButton
      conversationId={conversation.conversationId}
      calleeId={calleeId}
      calleeName={calleeName}
      disabled={conversation.status !== "active"}
    />
  );
}
