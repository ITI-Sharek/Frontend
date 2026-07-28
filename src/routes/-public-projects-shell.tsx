import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery, useLogoutMutation } from "@/modules/auth";
import { HomeHeader } from "@/modules/home";
import type { HomeHeaderAuthUser } from "@/modules/home";
import { SiteFooter } from "@/shared/components/layout/site-footer";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";

export function PublicProjectsShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const user = currentUserQuery.data;
  const headerUser: HomeHeaderAuthUser | null = user
    ? {
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        avatarUrl: user.avatarUrl,
        menuItems: getProfileMenuItems(user),
      }
    : null;

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <HomeHeader
        user={headerUser}
        onLogout={() => {
          logoutMutation.mutate(undefined, {
            onSettled: () => void navigate({ to: ROUTES.login }),
          });
        }}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function getProfileMenuItems(user: {
  role: "owner" | "contributor" | "admin";
  username: string | null;
}): ProfileMenuItem[] {
  return [{ label: "مساحة العمل", to: getPostLoginPath(user) }];
}
