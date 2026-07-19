import { createFileRoute } from "@tanstack/react-router";

import { NotificationCenter } from "@/modules/notifications";

export const Route = createFileRoute("/_appLayout/notifications")({
  head: () => ({
    meta: [{ title: "الإشعارات | Sharek" }],
  }),
  component: NotificationCenter,
});
