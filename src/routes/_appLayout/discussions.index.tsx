import { createFileRoute } from "@tanstack/react-router";

import { useCurrentUserQuery } from "@/modules/auth";
import { DiscussionsFeedView } from "@/modules/discussions";
import type { DiscussionAuthorDto } from "@/modules/discussions";

export const Route = createFileRoute("/_appLayout/discussions/")({
  head: () => ({ meta: [{ title: "النقاشات | Sharek" }] }),
  component: DiscussionsPage,
});

function DiscussionsPage() {
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;

  if (!currentUser || currentUser.role === "admin") {
    return null;
  }

  const currentAuthor: DiscussionAuthorDto = {
    id: currentUser.id,
    displayName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
    role: currentUser.role,
    avatarUrl: currentUser.avatarUrl,
  };

  return <DiscussionsFeedView currentAuthor={currentAuthor} />;
}
