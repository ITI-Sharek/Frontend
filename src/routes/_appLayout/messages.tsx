import { createFileRoute } from "@tanstack/react-router";

import { AssignmentConversationWorkspace } from "@/modules/assignment-conversations";
import { useCurrentUserQuery } from "@/modules/auth";

interface MessagesSearch {
  conversation?: string;
}

export const Route = createFileRoute("/_appLayout/messages")({
  head: () => ({ meta: [{ title: "المحادثات | Sharek" }] }),
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
    />
  );
}
