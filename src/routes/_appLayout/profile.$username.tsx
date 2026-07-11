import { createFileRoute } from "@tanstack/react-router";

import {
  ContributorProfileErrorView,
  ContributorProfileNotFound,
  ContributorProfileView,
  useContributorProfileQuery,
} from "@/modules/contributors";
import { getProfileRouteState } from "./profile-route-state";

export const Route = createFileRoute("/_appLayout/profile/$username")({
  head: ({ params }) => ({
    meta: [{ title: `@${params.username} | Sharek` }],
  }),
  component: ContributorProfilePage,
});

function ContributorProfilePage() {
  const { username } = Route.useParams();
  const profileQuery = useContributorProfileQuery(username);
  const routeState = getProfileRouteState({
    isPending: profileQuery.isPending,
    hasData: profileQuery.data !== undefined,
    error: profileQuery.error,
  });

  if (routeState === "loading") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <p className="text-muted-foreground">جارٍ تحميل ملف المساهم...</p>
      </div>
    );
  }

  if (routeState !== "ready") {
    if (routeState === "not-found") {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
          <ContributorProfileNotFound />
        </div>
      );
    }

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
        <ContributorProfileErrorView
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </div>
    );
  }

  return <ContributorProfileView profile={profileQuery.data} />;
}
