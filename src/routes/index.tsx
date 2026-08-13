import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
import { storageService } from "@/services/storage.service";

export const Route = createFileRoute("/")({ component: RootDispatcher });

/**
 * "/" has no content of its own: signed-out visitors go to the marketing
 * page at /lp, signed-in users go to their workspace home. Keeping this as
 * a redirect (rather than merging into /lp or /home) means both destinations
 * stay single-purpose and neither route has to know about the other.
 */
function RootDispatcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasToken =
    typeof window !== "undefined" && storageService.getAccessToken() !== null;
  const currentUserQuery = useCurrentUserQuery();

  useEffect(() => {
    if (!hasToken) {
      void navigate({ to: ROUTES.landing, replace: true });
      return;
    }

    if (currentUserQuery.data) {
      void navigate({ to: getPostLoginPath(currentUserQuery.data), replace: true });
      return;
    }

    if (currentUserQuery.isError) {
      void navigate({ to: ROUTES.landing, replace: true });
    }
  }, [hasToken, currentUserQuery.data, currentUserQuery.isError, navigate]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground"
    >
      {t("common.loading_ellipsis")}
    </div>
  );
}
