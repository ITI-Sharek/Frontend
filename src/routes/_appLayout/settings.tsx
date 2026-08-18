import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  LanguageSettingsSection,
  useCurrentUserQuery,
} from "@/modules/auth";
import {
  ContributorGithubSettingsSection,
  ContributorProfileSettingsSection,
  useContributorProfileQuery,
} from "@/modules/contributors";
import {
  disconnectGitHubAccount,
  startGitHubConnect,
} from "@/modules/github";
import { PersonalInformationSettingsPage } from "@/modules/settings";
import { NotificationPreferencesPanel } from "@/modules/notifications";
import { SubscriptionSettingsSection } from "@/modules/subscriptions";
import { Button } from "@/shared/components/ui/button";

type SettingsSectionId =
  | "profile"
  | "github"
  | "language"
  | "subscription"
  | "notifications";

interface SettingsSearch {
  section?: SettingsSectionId;
}

export const Route = createFileRoute("/_appLayout/settings")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    const section = search.section ?? search.tab;
    const isValid =
      section === "profile" ||
      section === "github" ||
      section === "language" ||
      section === "subscription" ||
      section === "notifications";
    return isValid ? { section } : {};
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate();
  const { section } = Route.useSearch();
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;
  const role = currentUser?.role;
  const username = currentUser?.username;

  const isContributor = role === "contributor";
  const isOwner = role === "owner";
  const profileQuery = useContributorProfileQuery(
    isContributor ? username ?? "" : "",
  );

  const activeSectionId = section ?? "profile";

  if (!currentUser) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-12 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        {t("settings.loadingProfile", "Loading profile...")}
      </div>
    );
  }

  return (
    <PersonalInformationSettingsPage
      user={currentUser}
      profile={profileQuery.data}
      activeSectionId={activeSectionId}
      profileDetailsSlot={
        isContributor && profileQuery.data ? (
          <ContributorProfileSettingsSection
            profile={profileQuery.data}
            onSaved={() => void profileQuery.refetch()}
          />
        ) : null
      }
      githubSlot={
        isContributor ? (
          profileQuery.data ? (
            <ContributorGithubSettingsSection
              profile={profileQuery.data}
              onConnectGitHub={() =>
                startGitHubConnect(`${ROUTES.settings}?section=github`)
              }
              onDisconnectGitHub={async () => {
                await disconnectGitHubAccount();
                await profileQuery.refetch();
              }}
              onOpenRepositories={() => {
                void navigate({ to: ROUTES.githubSkillAnalysis });
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("settings.loadingProfile")}
            </p>
          )
        ) : isOwner ? (
          <div className="flex items-start gap-4">
            <Github className="mt-1 size-6 shrink-0 text-foreground" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                {t("project.ownerGithub.title")}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("project.ownerGithub.description")}
              </p>
              <Button className="mt-2" asChild>
                <a href={ROUTES.githubSkillAnalysis}>
                  {t("project.ownerGithub.manage")}
                </a>
              </Button>
            </div>
          </div>
        ) : null
      }
      languageSlot={<LanguageSettingsSection />}
      notificationsSlot={<NotificationPreferencesPanel />}
      subscriptionSlot={<SubscriptionSettingsSection />}
      onNavigateToSection={(nextSection) =>
        navigate({ search: { section: nextSection } })
      }
    />
  );
}
