import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  NotificationCenter,
  NotificationPreferencesPanel,
  type ReadStateFilter,
} from "@/modules/notifications";
import { Button } from "@/shared/components/ui/button";

interface AdminNotificationsSearch {
  section?: ReadStateFilter;
}

export const Route = createFileRoute("/_adminLayout/admin/notifications")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): AdminNotificationsSearch => {
    const raw = search.section ?? search.tab;
    const isValid = raw === "all" || raw === "unread" || raw === "read";
    return isValid ? { section: raw as ReadStateFilter } : {};
  },
  component: AdminNotificationCenter,
});

function AdminNotificationCenter() {
  const { t } = useTranslation();
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <>
      <NotificationCenter
        activeSection={section}
        onSectionChange={(nextSection) => {
          void navigate({
            search: { section: nextSection },
            replace: true,
          });
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 md:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreferences((value) => !value)}
          aria-expanded={showPreferences}
        >
          {showPreferences
            ? t("adminPages.hideNotificationPreferences")
            : t("adminPages.manageNotificationPreferences")}
        </Button>
        {showPreferences && (
          <div className="mt-4 rounded-card border border-border bg-card p-6">
            <NotificationPreferencesPanel />
          </div>
        )}
      </div>
    </>
  );
}
