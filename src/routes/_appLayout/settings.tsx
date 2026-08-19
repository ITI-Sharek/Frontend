import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  LanguageSettingsSection,
  useCurrentUserQuery,
} from "@/modules/auth";
import {
  ContributorGithubSettingsSection,
  useContributorProfileQuery,
} from "@/modules/contributors";
import {
  disconnectGitHubAccount,
  startGitHubConnect,
} from "@/modules/github";
import { PersonalInformationSettingsPage } from "@/modules/settings";
import { NotificationPreferencesPanel } from "@/modules/notifications";
import { SubscriptionSettingsSection } from "@/modules/subscriptions";
import { OwnerGithubSettingsSection } from "@/modules/projects";

type SettingsSectionId =
  | "profile"
  | "github"
  | "language"
  | "subscription"
  | "notifications";

interface SettingsSearch {
  section?: SettingsSectionId;
  attemptId?: string;
  error?: string;
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
    const result: SettingsSearch = isValid ? { section } : {};
    if (typeof search.attemptId === "string" && search.attemptId !== "") {
      result.attemptId = search.attemptId;
    }
    if (typeof search.error === "string" && search.error !== "") {
      result.error = search.error;
    }
    return result;
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate();
  const { section, attemptId, error } = Route.useSearch();
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = currentUserQuery.data ?? routeContext.currentUser;
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
      githubSlot={
        isContributor ? (
          profileQuery.data ? (
            <ContributorGithubSettingsSection
              profile={profileQuery.data}
              attemptId={attemptId}
              callbackError={error}
              onClearCallback={() =>
                void navigate({
                  search: { section: "github" },
                  replace: true,
                })
              }
              onConnectGitHub={() =>
                startGitHubConnect(`${ROUTES.settings}?section=github`)
              }
              onDisconnectGitHub={async () => {
                await disconnectGitHubAccount();
                await profileQuery.refetch();
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("settings.loadingProfile")}
            </p>
          )
        ) : isOwner ? (
          <OwnerGithubSettingsSection
            attemptId={attemptId}
            callbackError={error}
            onClearCallback={() =>
              void navigate({
                search: { section: "github" },
                replace: true,
              })
            }
          />
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
