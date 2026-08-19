import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireMemberRoute } from "@/modules/auth";

export const Route = createFileRoute("/_appLayout/explore")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ExploreLayout,
});

function ExploreLayout() {
  return <Outlet />;
}
