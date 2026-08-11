import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Compass,
  MessageCircleQuestion,
  Plus,
} from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
import type { AuthUserDto } from "@/modules/auth";
import {
  ExploreProjectCard,
  useExploreProjectsQuery,
  useMyProjectsQuery,
} from "@/modules/projects";
import { useContributorProfileQuery } from "@/modules/contributors";
import {
  DiscussionPostCard,
  useDiscussionPostsQuery,
} from "@/modules/discussions";
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
  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-9 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-primary">
            {currentUser.role === "owner"
              ? "مساحة صاحب المشروع"
              : "مساحة المساهم"}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            أهلاً، {displayName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {currentUser.role === "owner"
              ? "راجع مشاريعك وابدأ طلب مساهمة جديداً من سياق المشروع نفسه."
              : "تابع سجلك، واكتشف عملاً مفتوحاً يناسب خبرتك الحالية."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link
            to={currentUser.role === "owner" ? ROUTES.newProject : ROUTES.tasks}
          >
            {currentUser.role === "owner" ? (
              <Plus className="size-4" aria-hidden />
            ) : (
              <Compass className="size-4" aria-hidden />
            )}
            {currentUser.role === "owner"
              ? "أضف مشروعاً"
              : "استكشف طلبات المساهمة"}
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>

      <MyWorksSection currentUser={currentUser} />

      <ExplorePreviewSection />

      <div className="grid gap-4 sm:grid-cols-2">
        <DiscussionsPreviewSection />
        <SupportPreviewCard />
      </div>
    </div>
  );
}

function ExplorePreviewSection() {
  const exploreQuery = useExploreProjectsQuery({});
  const projects = exploreQuery.data?.projects.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={Compass}
        title="استكشف المشاريع"
        href={ROUTES.explore}
        hrefLabel="عرض الكل"
      />
      {exploreQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      ) : projects.length === 0 ? (
        <EmptyPreviewCard label="لا توجد مشاريع لعرضها حالياً." />
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
  const projectsQuery = useMyProjectsQuery();
  const projects = projectsQuery.data?.projects.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={BriefcaseBusiness}
        title="أعمالي"
        href={ROUTES.myProjects}
        hrefLabel="عرض كل مشاريعي"
      />
      {projectsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      ) : projects.length === 0 ? (
        <EmptyPreviewCard label="لم تنشئ مشاريع بعد." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={ROUTES.myProjects}
              className="flex min-h-16 items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface-fog"
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
  const profileQuery = useContributorProfileQuery(username);
  const history = profileQuery.data?.contributionHistory.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={BriefcaseBusiness}
        title="أعمالي"
        href={ROUTES.contributorProfile(username)}
        hrefLabel="عرض سجل مساهماتي"
      />
      {profileQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      ) : history.length === 0 ? (
        <EmptyPreviewCard label="لا توجد مساهمات موثّقة بعد." />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {history.map((item) => (
            <Link
              key={item.id}
              to={ROUTES.contributorProfile(username)}
              className="flex min-h-16 flex-col justify-center gap-1 px-5 py-4 transition-colors hover:bg-surface-fog"
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
  const postsQuery = useDiscussionPostsQuery();
  const posts = postsQuery.data?.slice(0, 2) ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={MessageCircleQuestion}
        title="النقاشات"
        href={ROUTES.discussions}
        hrefLabel="عرض الكل"
      />
      {postsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      ) : posts.length === 0 ? (
        <EmptyPreviewCard label="لا توجد منشورات بعد." />
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
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <MessageCircleQuestion className="size-4.5 text-primary" aria-hidden />
        بحاجة مساعدة؟
      </h2>
      <Link
        to={ROUTES.support}
        className="flex flex-1 flex-col justify-between gap-3 rounded-card border border-border bg-surface-fog p-5 transition-colors hover:border-primary/40"
      >
        <p className="text-sm leading-6 text-muted-foreground">
          راسل فريق الدعم أو اطّلع على أساسيات Sharek.
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          الذهاب لصفحة الدعم
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
    <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
      <div>
        <Icon className="mb-2 size-4.5 text-primary" aria-hidden />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <Link
        to={href}
        className="inline-flex min-h-10 items-center gap-1 px-2 text-sm font-semibold text-primary hover:bg-primary/[0.05]"
      >
        {hrefLabel}
        <ArrowLeft className="size-4" aria-hidden />
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
