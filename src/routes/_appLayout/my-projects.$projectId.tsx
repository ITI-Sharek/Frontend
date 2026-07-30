import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireMemberRoute } from "@/modules/auth";

export const Route = createFileRoute("/_appLayout/my-projects/$projectId")({
  beforeLoad: requireMemberRoute,
  component: ProjectRouteLayout,
});

export function ProjectRouteLayout() {
  return <Outlet />;
}
