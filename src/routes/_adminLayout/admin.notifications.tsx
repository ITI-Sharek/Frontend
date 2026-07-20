import { createFileRoute } from "@tanstack/react-router";

import { NotificationCenter } from "@/modules/notifications";

export const Route = createFileRoute("/_adminLayout/admin/notifications")({
  head: () => ({
    meta: [{ title: "إشعارات الإدارة | Sharek" }],
  }),
  component: NotificationCenter,
});
