import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useCurrentUserQuery } from "@/modules/auth";
import { DiscussionPostDetailView, useDiscussionPostQuery } from "@/modules/discussions";
import type { DiscussionAuthorDto } from "@/modules/discussions";

export const Route = createFileRoute("/_appLayout/discussions/$postId")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: DiscussionPostPage,
});

function DiscussionPostPage() {
  const { t } = useTranslation();
  const { postId } = Route.useParams();
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;
  const postQuery = useDiscussionPostQuery(postId);

  if (!currentUser || currentUser.role === "admin") {
    return null;
  }

  if (postQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("discussions.loading")}</p>
      </div>
    );
  }

  if (postQuery.data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">{t("discussions.mock.postNotFound")}</p>
      </div>
    );
  }

  const currentAuthor: DiscussionAuthorDto = {
    id: currentUser.id,
    displayName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
    role: currentUser.role,
    avatarUrl: currentUser.avatarUrl,
  };

  return <DiscussionPostDetailView post={postQuery.data} currentAuthor={currentAuthor} />;
}
