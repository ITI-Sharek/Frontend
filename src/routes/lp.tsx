import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery, useLogoutMutation } from "@/modules/auth";
import {
  CollaborationSpaceSection,
  ContributionRecordSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  HomeHeader,
  HowItWorksSection,
  RolesSection,
} from "@/modules/home";
import type { HomeHeaderAuthUser } from "@/modules/home";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";
import { SiteFooter } from "@/shared/components/layout/site-footer";

export const Route = createFileRoute("/lp")({ component: LandingPage });

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate({ to: ROUTES.login });
      },
    });
  }

  const authUser = currentUserQuery.data;
  const headerUser: HomeHeaderAuthUser | null = authUser
    ? {
        displayName: `${authUser.firstName} ${authUser.lastName}`.trim(),
        avatarUrl: authUser.avatarUrl,
        menuItems: getProfileMenuItems(authUser, t),
      }
    : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <HomeHeader user={headerUser} onLogout={handleLogout} />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CollaborationSpaceSection />
        <RolesSection />
        <ContributionRecordSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function getProfileMenuItems(user: {
  role: "owner" | "contributor" | "admin";
  username: string | null;
}, t: (key: string) => string): ProfileMenuItem[] {
  const label =
    user.role === "admin"
      ? t("navigation.adminPanel")
      : user.role === "owner"
        ? t("navigation.myProjects")
        : user.username
          ? t("navigation.profile")
          : t("navigation.onboarding");

  return [{ label, to: getPostLoginPath(user) }];
}
