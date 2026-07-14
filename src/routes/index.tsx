import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery, useLogoutMutation } from "@/modules/auth";
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  HomeHeader,
  HowItWorksSection,
  PlansSection,
  RolesSection,
  TasksMarqueeSection,
} from "@/modules/home";
import type { HomeHeaderAuthUser } from "@/modules/home";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";
import { SiteFooter } from "@/shared/components/layout/site-footer";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
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
        menuItems: getProfileMenuItems(authUser),
      }
    : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <HomeHeader user={headerUser} onLogout={handleLogout} />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RolesSection />
        <TasksMarqueeSection />
        <PlansSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function getProfileMenuItems(user: {
  role: "owner" | "contributor" | "admin";
  username: string | null;
}): ProfileMenuItem[] {
  if (user.role === "contributor" && user.username) {
    return [{ label: "ملفي الشخصي", to: ROUTES.contributorProfile(user.username) }];
  }
  if (user.role === "owner") {
    return [{ label: "مشاريعي", to: ROUTES.myProjects }];
  }
  return [];
}
