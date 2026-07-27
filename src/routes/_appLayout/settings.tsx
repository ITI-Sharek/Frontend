import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
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
  LanguageSettingsSection,
  SettingsShell,
  SubscriptionSettingsSection,
} from "@/modules/settings";
import type { SettingsSectionItem } from "@/modules/settings";

type SettingsSectionId = "profile" | "github" | "language" | "subscription";

interface SettingsSearch {
  section?: SettingsSectionId;
}

export const Route = createFileRoute("/_appLayout/settings")({
  head: () => ({ meta: [{ title: "الإعدادات | Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    const section = search.section;
    const isValid =
      section === "profile" ||
      section === "github" ||
      section === "language" ||
      section === "subscription";
    return isValid ? { section } : {};
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = Route.useNavigate();
  const { section } = Route.useSearch();
  const currentUserQuery = useCurrentUserQuery();
  const role = currentUserQuery.data?.role;
  const username = currentUserQuery.data?.username;

  const isContributor = role === "contributor";
  const profileQuery = useContributorProfileQuery(username ?? "");

  const sections: SettingsSectionItem[] = [
    ...(isContributor
      ? [
          { id: "profile", label: "الملف الشخصي" },
          { id: "github", label: "GitHub" },
        ]
      : []),
    { id: "language", label: "اللغة" },
    { id: "subscription", label: "الاشتراك" },
  ];

  const activeSectionId = section ?? sections[0].id;

  function handleSelectSection(id: string) {
    navigate({ search: { section: id as SettingsSectionId } });
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
              جارٍ تحميل بيانات ملفك...
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
              جارٍ تحميل بيانات ملفك...
            </p>
          )}
        </>
      )}

      {activeSectionId === "language" && <LanguageSettingsSection />}
      {activeSectionId === "subscription" && <SubscriptionSettingsSection />}
    </SettingsShell>
  );
}
