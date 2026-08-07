import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute, useResolvedCurrentUser } from "@/modules/auth";
import { ApplicationStatusView } from "@/modules/contribution-requests";

export const Route = createFileRoute(
  "/_appLayout/applications/$applicationId",
)({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "حالة طلب التقديم | Sharek" }] }),
  component: ApplicationStatusPage,
});

/**
 * The contributor's own view of an Application, including the withdraw control.
 *
 * `beforeLoad` keeps other roles out, but it cannot enforce during SSR: the
 * server has no session, so `requireRouteAccess` returns an empty context and
 * the guard's redirect only lands once the client takes over. Rendering the
 * contributor's controls in the meantime showed an owner a withdraw button
 * that was never theirs — so the view waits for a confirmed contributor rather
 * than assuming one.
 */
function ApplicationStatusPage() {
  const { applicationId } = Route.useParams();
  const { currentUser: contextUser } = Route.useRouteContext();
  const { currentUser, isResolving } = useResolvedCurrentUser(contextUser);

  if (isResolving || !currentUser) {
    return (
      <p role="status" className="p-8 text-center text-sm text-muted-foreground">
        جارٍ التحقق من الحساب…
      </p>
    );
  }

  // The guard is already redirecting; this only stops the wrong controls from
  // flashing on the way out.
  if (currentUser.role !== "contributor") {
    return (
      <p role="status" className="p-8 text-center text-sm text-muted-foreground">
        جارٍ تحويلك إلى الصفحة المناسبة لحسابك…
      </p>
    );
  }

  return (
    <ApplicationStatusView
      applicationId={applicationId}
      requestHref={(requestId) =>
        `${ROUTES.tasks}/${encodeURIComponent(requestId)}`
      }
      requestsHref={ROUTES.tasks}
    />
  );
}
