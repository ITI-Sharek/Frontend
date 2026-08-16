import { Navigate, createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
import { AuthenticatedHomeView } from "@/modules/home";

export const Route = createFileRoute("/_appLayout/home")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: HomePage,
});

function HomePage() {
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;

  if (!currentUser || currentUser.role === "admin") {
    return null;
  }

  if (currentUser.role === "contributor") {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <AuthenticatedHomeView
      currentUser={{
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        role: "owner",
      }}
    />
  );
}
