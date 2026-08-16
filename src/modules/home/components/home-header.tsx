import { Bell, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  HeaderIconLink,
  SiteHeader,
} from "@/shared/components/layout/site-header";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";

export interface HomeHeaderAuthUser {
  displayName: string;
  avatarUrl: string | null;
  profileSubtitle?: string;
  menuItems: ProfileMenuItem[];
}

export function HomeHeader({
  user,
  onLogout,
}: {
  /** Injected by the route. Omitted/undefined renders the signed-out CTAs. */
  user?: HomeHeaderAuthUser | null;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const navItems = [
    { href: ROUTES.publicProjects, label: t("landing.headerPublicProjects") },
    { href: "#journey", label: t("landing.headerJourney") },
    { href: "#evidence", label: t("landing.headerEvidence") },
    { href: "#for-who", label: t("landing.headerForWhom") },
  ];

  return (
    <SiteHeader
      navItems={navItems}
      navLabel={t("landing.headerNavAriaLabel")}
      skipToContentLabel={t("landing.headerSkipToContent")}
      user={user ? { ...user, online: true } : null}
      onLogout={onLogout}
      utilityActions={
        user && onLogout ? (
          <>
            <HeaderIconLink
              to={ROUTES.messages}
              label={t("assignmentConversations.button.openAria")}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </HeaderIconLink>
            <HeaderIconLink
              to={ROUTES.notifications}
              label={t("notifications.center.title")}
            >
              <Bell className="size-4" aria-hidden="true" />
            </HeaderIconLink>
          </>
        ) : undefined
      }
    />
  );
}
