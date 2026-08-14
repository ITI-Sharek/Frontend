import { createFileRoute } from "@tanstack/react-router";

import { PlanPageView } from "@/modules/subscriptions";

export const Route = createFileRoute("/_appLayout/plan")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: PlanPageView,
});
