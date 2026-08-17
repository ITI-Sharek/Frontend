import { createFileRoute } from "@tanstack/react-router";
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
import {
  PersonalInformationSettingsPage,
  SettingsShell,
} from "@/modules/settings";
import { NotificationPreferencesPanel } from "@/modules/notifications";
import { SubscriptionSettingsSection } from "@/modules/subscriptions";
import type { SettingsSectionItem } from "@/modules/settings";

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
    return isValid ? { section: section as SettingsSectionId } : {};
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
  const profileQuery = useContributorProfileQuery(
    isContributor ? username ?? "" : "",
  );

  const sections: SettingsSectionItem[] = [
    { id: "profile", label: t("settings.sections.profile") },
    ...(isContributor ? [{ id: "github", label: "GitHub" }] : []),
    { id: "language", label: t("settings.sections.language") },
    { id: "notifications", label: t("settings.sections.notifications") },
    { id: "subscription", label: t("settings.sections.subscription") },
  ];

  const activeSectionId = section ?? sections[0].id;

  function handleSelectSection(id: string) {
    navigate({ search: { section: id as SettingsSectionId } });
  }

  if (activeSectionId === "profile" && currentUser) {
    return (
      <PersonalInformationSettingsPage
        user={currentUser}
        profile={profileQuery.data}
        onNavigateToSection={(nextSection) =>
          navigate({ search: { section: nextSection } })
        }
      />
    );
  }

  return (
    <SettingsShell
      sections={sections}
      activeSectionId={activeSectionId}
      onSelectSection={handleSelectSection}
    >
      {activeSectionId === "profile" && isContributor && (
        <>
          {profileQuery.data ? (
            <ContributorProfileSettingsSection profile={profileQuery.data} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("settings.loadingProfile")}
            </p>
          )}
        </>
      )}

      {activeSectionId === "github" && isContributor && (
        <>
          {profileQuery.data ? (
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
          )}
        </>
      )}

      {activeSectionId === "language" && <LanguageSettingsSection />}
      {activeSectionId === "notifications" && <NotificationPreferencesPanel />}
      {activeSectionId === "subscription" && <SubscriptionSettingsSection />}
    </SettingsShell>
  );
}
