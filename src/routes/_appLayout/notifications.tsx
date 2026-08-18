import { createFileRoute } from "@tanstack/react-router";

import { NotificationCenter } from "@/modules/notifications";
import type { ReadStateFilter } from "@/modules/notifications";

interface NotificationsSearch {
  section?: ReadStateFilter;
}

export const Route = createFileRoute("/_appLayout/notifications")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  validateSearch: (search: Record<string, unknown>): NotificationsSearch => {
    const raw = search.section ?? search.tab;
    const isValid = raw === "all" || raw === "unread" || raw === "read";
    return isValid ? { section: raw } : {};
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <NotificationCenter
      activeSection={section}
      onSectionChange={(nextSection) => {
        void navigate({
          search: { section: nextSection },
          replace: true,
        });
      }}
    />
  );
}
