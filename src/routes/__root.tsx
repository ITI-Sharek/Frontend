import { HeadContent, Scripts, createRootRoute, useRouterState } from "@tanstack/react-router";
import { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AppProviders } from "@/providers/app-providers";
import {
  RouteProgressBar,
  RouteTransitionVeil,
} from "@/shared/components/feedback/sharek-loader";
import {
  ACTIVE_ROUTE_TRANSITION,
  useDelayedFlag,
  useIsNavigating,
} from "@/shared/hooks/use-route-loading";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sharek" },
      {
        name: "description",
        content: "Sharek",
      },
      { name: "theme-color", content: "#f6f7f4", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0e1513", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo-1.png" },
      { rel: "apple-touch-icon", href: "/logo-1.png" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <AppProviders>
          <LocalizedDocumentContent>{children}</LocalizedDocumentContent>
        </AppProviders>
        <Scripts />
      </body>
    </html>
  );
}

function LocalizedDocumentContent({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "ar";
  const direction = language === "en" ? "ltr" : "rtl";
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.title = `${t(getRouteTitleKey(pathname))} | Sharek`;
  }, [direction, language, pathname, t]);

  return (
    <Fragment key={language}>
      <RouteTransition />
      {children}
    </Fragment>
  );
}

/**
 * Global navigation feedback. Mounted once at the document root so every
 * route — public, workspace and admin alike — gets the same transition
 * instead of each layout inventing its own spinner.
 */
function RouteTransition() {
  const navigating = useIsNavigating();
  const showBar = useDelayedFlag(navigating, ACTIVE_ROUTE_TRANSITION.bar);
  const showVeil = useDelayedFlag(navigating, ACTIVE_ROUTE_TRANSITION.veil);

  return (
    <>
      {showBar ? <RouteProgressBar /> : null}
      {showVeil ? <RouteTransitionVeil /> : null}
    </>
  );
}

function getRouteTitleKey(pathname: string) {
  if (pathname === "/") return "pageTitles.home";
  if (pathname === "/login" || pathname === "/auth/callback") return "pageTitles.login";
  if (pathname === "/register") return "pageTitles.register";
  if (pathname === "/forgot-password") return "pageTitles.forgotPassword";
  if (pathname.startsWith("/admin/skill-reviews")) return "pageTitles.skillReviews";
  if (pathname.startsWith("/admin/project-owners")) return "pageTitles.projectOwners";
  if (pathname.startsWith("/admin/profile-fields")) return "pageTitles.profileFields";
  if (pathname.startsWith("/admin/experience-levels")) return "pageTitles.experienceLevels";
  if (pathname.startsWith("/admin/notifications")) return "pageTitles.adminNotifications";
  if (pathname.startsWith("/admin")) return "pageTitles.admin";
  if (pathname.startsWith("/dashboard")) return "pageTitles.dashboard";
  if (pathname.startsWith("/tasks/")) return "pageTitles.contributionRequest";
  if (pathname.startsWith("/tasks")) return "pageTitles.contributionRequests";
  if (pathname.startsWith("/applications/")) return "pageTitles.application";
  if (pathname.startsWith("/contribution-requests/")) return "pageTitles.contributionRequest";
  if (pathname.startsWith("/my-projects/new")) return "pageTitles.importProject";
  if (pathname.includes("/contribution-requests/new")) return "pageTitles.newContributionRequest";
  if (pathname.includes("/contribution-requests")) return "pageTitles.contributionRequests";
  if (pathname.startsWith("/my-projects/")) return "pageTitles.project";
  if (pathname.startsWith("/my-projects")) return "pageTitles.myProjects";
  if (pathname.startsWith("/projects")) return "pageTitles.projects";
  if (pathname.startsWith("/notifications")) return "pageTitles.notifications";
  if (pathname.startsWith("/messages")) return "pageTitles.messages";
  if (pathname.startsWith("/discussions/")) return "pageTitles.discussion";
  if (pathname.startsWith("/discussions")) return "pageTitles.discussions";
  if (pathname.startsWith("/settings")) return "pageTitles.settings";
  if (pathname.startsWith("/support")) return "pageTitles.support";
  if (pathname.startsWith("/onboarding")) return "pageTitles.onboarding";
  if (pathname.startsWith("/profile/github")) return "pageTitles.githubSkills";
  if (pathname.startsWith("/explore")) return "pageTitles.explore";
  if (pathname.startsWith("/home")) return "pageTitles.home";
  return "pageTitles.home";
}
