import { createFileRoute } from "@tanstack/react-router";

import { SupportView } from "@/modules/support";

export const Route = createFileRoute("/_appLayout/support")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: SupportView,
});
