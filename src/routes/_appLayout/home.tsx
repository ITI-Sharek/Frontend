import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BriefcaseBusiness, Compass, MessageCircleQuestion, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
import type { AuthUserDto } from "@/modules/auth";
import {
  ExploreProjectCard,
  useExploreProjectsQuery,
  useMyProjectsQuery,
} from "@/modules/projects";
import { useContributorProfileQuery } from "@/modules/contributors";
import { DiscussionPostCard, useDiscussionPostsQuery } from "@/modules/discussions";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_appLayout/home")({
  head: () => ({ meta: [{ title: "الرئيسية | Sharek" }] }),
  component: HomeHubPage,
});

function HomeHubPage() {
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;

  if (!currentUser || currentUser.role === "admin") {
    return null;
  }

  return <HomeHubView currentUser={currentUser} />;
}

function HomeHubView({ currentUser }: { currentUser: AuthUserDto }) {
  const { t } = useTranslation();
  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("home.greeting", { name: displayName })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("home.subtitle")}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to={ROUTES.newProject}>
            <Plus className="size-4" aria-hidden />
            {t("home.addProject")}
          </Link>
        </Button>
      </div>

      <ExplorePreviewSection />
      <MyWorksSection currentUser={currentUser} />

      <div className="grid gap-4 sm:grid-cols-2">
        <DiscussionsPreviewSection />
        <SupportPreviewCard />
      </div>
    </div>
  );
}

function ExplorePreviewSection() {
  const { t } = useTranslation();
  const exploreQuery = useExploreProjectsQuery({});
  const projects = exploreQuery.data?.projects.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        icon={Compass}
        title={t("home.exploreProjects")}
        href={ROUTES.explore}
        hrefLabel={t("home.viewAll")}
      />
      {exploreQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : projects.length === 0 ? (
        <EmptyPreviewCard label={t("home.noProjectsToShow")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ExploreProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}

function MyWorksSection({ currentUser }: { currentUser: AuthUserDto }) {
  if (currentUser.role === "owner") {
    return <OwnerWorksPreview />;
  }
  return <ContributorWorksPreview username={currentUser.username ?? ""} />;
}

function OwnerWorksPreview() {
  const { t } = useTranslation();
  const projectsQuery = useMyProjectsQuery();
  const projects = projectsQuery.data?.projects.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        icon={BriefcaseBusiness}
        title={t("home.myWorks")}
        href={ROUTES.myProjects}
        hrefLabel={t("home.viewAllMyProjects")}
      />
      {projectsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : projects.length === 0 ? (
        <EmptyPreviewCard label={t("home.noProjects")} />
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={ROUTES.myProjects}
              className="flex items-center justify-between gap-3 rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                {project.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {project.lastActivityLabel}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ContributorWorksPreview({ username }: { username: string }) {
  const { t } = useTranslation();
  const profileQuery = useContributorProfileQuery(username);
  const history = profileQuery.data?.contributionHistory.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        icon={BriefcaseBusiness}
        title={t("home.myWorks")}
        href={ROUTES.contributorProfile(username)}
        hrefLabel={t("home.viewContributionHistory")}
      />
      {profileQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : history.length === 0 ? (
        <EmptyPreviewCard label={t("home.noContributions")} />
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((item) => (
            <Link
              key={item.id}
              to={ROUTES.contributorProfile(username)}
              className="flex flex-col gap-1 rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span className="text-sm font-semibold text-foreground">
                {item.title}
              </span>
              {item.role && (
                <span className="text-xs text-evidence-teal">{item.role}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DiscussionsPreviewSection() {
  const { t } = useTranslation();
  const postsQuery = useDiscussionPostsQuery();
  const posts = postsQuery.data?.slice(0, 2) ?? [];

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        icon={MessageCircleQuestion}
        title={t("home.discussions")}
        href={ROUTES.discussions}
        hrefLabel={t("home.viewAll")}
      />
      {postsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : posts.length === 0 ? (
        <EmptyPreviewCard label={t("home.noPosts")} />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <DiscussionPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

function SupportPreviewCard() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <MessageCircleQuestion className="size-4.5 text-primary" aria-hidden />
        {t("home.needHelp")}
      </h2>
      <Link
        to={ROUTES.support}
        className="flex flex-1 flex-col justify-between gap-3 rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/50"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {t("home.supportDescription")}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {t("home.goToSupport")}
          <ArrowLeft className="size-4" aria-hidden />
        </span>
      </Link>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  href,
  hrefLabel,
}: {
  icon: typeof Compass;
  title: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Icon className="size-4.5 text-primary" aria-hidden />
        {title}
      </h2>
      <Link to={href} className="text-xs font-semibold text-primary hover:opacity-80">
        {hrefLabel}
      </Link>
    </div>
  );
}

function EmptyPreviewCard({ label }: { label: string }) {
  return (
    <p className="rounded-card border border-border bg-card p-5 text-center text-sm text-muted-foreground">
      {label}
    </p>
  );
}
