import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  NotificationCenter,
  NotificationPreferencesPanel,
} from "@/modules/notifications";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_adminLayout/admin/notifications")({
  head: () => ({
    meta: [{ title: "إشعارات الإدارة | Sharek" }],
  }),
  component: AdminNotificationCenter,
});

function AdminNotificationCenter() {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <>
      <NotificationCenter />
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 md:px-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreferences((value) => !value)}
          aria-expanded={showPreferences}
        >
          {showPreferences
            ? "إخفاء تفضيلات الإشعارات"
            : "إدارة تفضيلات الإشعارات"}
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
