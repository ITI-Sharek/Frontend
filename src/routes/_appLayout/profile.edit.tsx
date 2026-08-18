import { createFileRoute, redirect } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";

export const Route = createFileRoute("/_appLayout/profile/edit")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.settings });
  },
});
