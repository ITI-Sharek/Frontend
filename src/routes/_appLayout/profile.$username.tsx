import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import {
  ContributorProfileErrorView,
  ContributorProfileNotFound,
  ContributorProfileView,
  useContributorProfileQuery,
} from "@/modules/contributors";
import { shouldRedirectUnauthenticatedProfile } from "./profile-auth.helpers";
import { getProfileRouteState } from "./profile-route-state";

export function beforeLoadContributorProfile() {
  if (shouldRedirectUnauthenticatedProfile()) {
    throw redirect({ to: ROUTES.login });
  }
}

export const Route = createFileRoute("/_appLayout/profile/$username")({
  head: ({ params }) => ({
    meta: [{ title: `@${params.username} | Sharek` }],
  }),
  beforeLoad: beforeLoadContributorProfile,
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

  if (routeState !== "ready" || profileQuery.data === undefined) {
    if (routeState === "not-found") {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
          <ContributorProfileNotFound />
        </div>
      );
    }

    if (routeState === "unauthenticated") {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4">
          <ContributorProfileErrorView message="انتهت الجلسة. سجل دخولك مجدداً لعرض ملف المساهم." />
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
