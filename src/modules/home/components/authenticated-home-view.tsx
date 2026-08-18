import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FilePlus2,
  FolderKanban,
  Github,
  Layers,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { useMyProjectsQuery } from "@/modules/projects";
import { Button } from "@/shared/components/ui/button";
import { useTextDirection } from "@/shared/hooks/use-text-direction";

export interface AuthenticatedHomeUser {
  email: string;
  firstName: string;
  lastName: string;
  username: string | null;
  role: "owner" | "contributor";
}

const CATEGORY_CHIPS = [
  { id: "development", labelAr: "البرمجة والتطوير", labelEn: "Development" },
  { id: "ai", labelAr: "الذكاء الاصطناعي", labelEn: "AI & ML" },
  { id: "data", labelAr: "علوم البيانات", labelEn: "Data Science" },
  { id: "cloud", labelAr: "السحابة وديف أوبس", labelEn: "Cloud & DevOps" },
  { id: "security", labelAr: "الأمن السيبراني", labelEn: "Cybersecurity" },
  { id: "design", labelAr: "واجهات وتجربة المستخدم", labelEn: "UI/UX Design" },
] as const;

export function AuthenticatedHomeView({
  currentUser,
}: {
  currentUser: AuthenticatedHomeUser;
}) {
  const { t, i18n } = useTranslation();
  const dir = useTextDirection();
  const isArabic = i18n.language.startsWith("ar");
  const isRtl = dir === "rtl";
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const projectsQuery = useMyProjectsQuery();
  const projects = projectsQuery.data?.projects ?? [];
  const quota = projectsQuery.data?.quota;

  const publishedProjectsCount = projects.filter(
    (p) => p.status === "published",
  ).length;
  const draftProjectsCount = projects.filter(
    (p) => p.status === "draft",
  ).length;
  const totalOpenRequests = projects.reduce(
    (acc, p) => acc + (p.openRequestsCount || 0),
    0,
  );
  const totalPendingApps = projects.reduce(
    (acc, p) => acc + (p.pendingApplicationsCount || 0),
    0,
  );

  const displayName =
    currentUser.username ||
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    void navigate({
      to: ROUTES.explore,
      search: query === "" ? {} : { q: query },
    });
  }

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;
  const ActionArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ═════════ 1. HERO COMMAND CENTER ═════════ */}
      <section
        aria-labelledby="owner-home-hero-title"
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-6 shadow-sm sm:p-8 md:p-10"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-extrabold text-primary ring-1 ring-primary/25">
                <Sparkles className="size-3.5" />
                <span>{t("home.owner.commandCenter")}</span>
              </span>
              <span className="rounded-full bg-surface-fog px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/80">
                {t("home.owner.welcome", { name: displayName })}
              </span>
            </div>

            <h1
              id="owner-home-hero-title"
              className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {t("home.owner.heroTitle")}
            </h1>

            <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              {t("home.ownerSubtitle")}
            </p>

            {/* Quick Search */}
            <form
              role="search"
              onSubmit={handleSearch}
              className="mt-4 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            >
              <Search className="ms-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="owner-home-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={t("home.owner.searchPlaceholder")}
                className="w-full bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="rounded-xl px-4 font-bold shrink-0">
                {t("home.owner.searchAction")}
              </Button>
            </form>
          </div>

          {/* Primary Quick Launch CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col shrink-0">
            <Button
              asChild
              size="lg"
              className="gap-2.5 rounded-2xl px-6 font-bold text-sm h-12 shadow-xs"
            >
              <Link to={ROUTES.newProject}>
                <Plus className="size-4 stroke-[2.5]" />
                <span>{t("home.owner.newProject")}</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2.5 rounded-2xl px-6 font-bold text-sm h-12 border-border/90 bg-card hover:bg-muted/40"
            >
              <Link to={ROUTES.explore}>
                <Compass className="size-4 text-primary" />
                <span>{t("home.owner.browseDevelopers")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═════════ 2. LIVE METRICS KPI CARDS ═════════ */}
      <section aria-label={t("home.owner.commandCenter")} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Published Projects */}
        <Link
          to={ROUTES.myProjects}
          className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/20"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {t("home.owner.stats.publishedProjects")}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FolderKanban className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-foreground">
              {projectsQuery.isPending ? "–" : publishedProjectsCount}
            </span>
            <ArrowIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </Link>

        {/* Draft Projects */}
        <Link
          to={ROUTES.myProjects}
          className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/20"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {t("home.owner.stats.draftProjects")}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Layers className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-foreground">
              {projectsQuery.isPending ? "–" : draftProjectsCount}
            </span>
            <ArrowIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </Link>

        {/* Open Tasks / Requests */}
        <Link
          to={ROUTES.tasks}
          className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/20"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {t("home.owner.stats.openTasks")}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-foreground">
              {projectsQuery.isPending ? "–" : totalOpenRequests}
            </span>
            <ArrowIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </Link>

        {/* Pending Applications Requiring Action */}
        <Link
          to={ROUTES.myProjects}
          className={cn(
            "group flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all",
            totalPendingApps > 0
              ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10"
              : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/20",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {t("home.owner.stats.pendingReview")}
            </span>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-xl",
                totalPendingApps > 0
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Activity className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-2xl font-black text-foreground">
                {projectsQuery.isPending ? "–" : totalPendingApps}
              </span>
              {totalPendingApps > 0 && (
                <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <ArrowIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>
        </Link>

        {/* Monthly Project Quota Meter */}
        <Link
          to={ROUTES.plan}
          className="group col-span-2 sm:col-span-1 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs transition-all hover:border-primary/50 hover:bg-muted/20"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {t("home.owner.stats.monthlyQuota")}
            </span>
            <span className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="font-mono text-foreground">
                {quota
                  ? t("home.owner.stats.usedOf", {
                      used: quota.used,
                      total: quota.monthlyLimit,
                    })
                  : "–"}
              </span>
              <span className="text-2xs text-primary font-bold">
                {isArabic ? "ترقية" : "Upgrade"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all rounded-full"
                style={{
                  width: quota
                    ? `${Math.min(100, Math.round((quota.used / Math.max(1, quota.monthlyLimit)) * 100))}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </Link>
      </section>

      {/* ═════════ 3. MAIN WORKSPACE GRID ═════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* ── Left / Main Section (8 cols) ── */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Active Projects Portfolio */}
          <section
            aria-labelledby="home-projects-title"
            className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h2
                  id="home-projects-title"
                  className="text-lg font-black tracking-tight text-foreground sm:text-xl"
                >
                  {t("home.owner.projects.title")}
                </h2>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {t("home.owner.projects.subtitle")}
                </p>
              </div>

              {projects.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="gap-1 font-bold text-xs text-primary">
                  <Link to={ROUTES.myProjects}>
                    <span>{t("home.owner.projects.viewAll")}</span>
                    <ActionArrow className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Projects List or Empty State */}
            {projectsQuery.isPending ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted/40" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-surface-fog/40 p-8 text-center sm:p-10">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <FolderKanban className="size-7 stroke-[2]" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-foreground">
                  {t("home.owner.projects.createFirst")}
                </h3>
                <p className="mt-1.5 max-w-sm text-xs font-medium text-muted-foreground leading-relaxed">
                  {t("home.owner.projects.createFirstDesc")}
                </p>
                <Button asChild size="default" className="mt-5 gap-2 rounded-xl font-bold text-xs">
                  <Link to={ROUTES.newProject}>
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>{t("home.owner.newProject")}</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {projects.slice(0, 4).map((project) => {
                  const isPublished = project.status === "published";
                  return (
                    <div
                      key={project.id}
                      className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface-fog/30 p-4.5 transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-2xs font-bold",
                              isPublished
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {isPublished
                              ? isArabic
                                ? "منشور"
                                : "Published"
                              : isArabic
                                ? "مسودة"
                                : "Draft"}
                          </span>

                          <span className="font-mono text-2xs text-muted-foreground">
                            {project.lastActivityLabel}
                          </span>
                        </div>

                        <h3 className="mt-2.5 text-base font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                          <Link to={ROUTES.ownerProject(project.id)}>
                            {project.title}
                          </Link>
                        </h3>

                        {/* Chips */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Link
                            to={ROUTES.ownerContributionRequests(project.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card px-2 py-0.5 text-2xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <CheckCircle2 className="size-3 text-primary" />
                            <span>
                              {t("home.owner.projects.openTasksCount", {
                                count: project.openRequestsCount || 0,
                              })}
                            </span>
                          </Link>

                          {project.pendingApplicationsCount > 0 && (
                            <Link
                              to={ROUTES.ownerContributionRequests(project.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-2xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/25"
                            >
                              <Activity className="size-3" />
                              <span>
                                {t("home.owner.projects.pendingAppsCount", {
                                  count: project.pendingApplicationsCount,
                                })}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Project Card Bottom Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                        <Button
                          asChild
                          variant="ghost"
                          size="xs"
                          className="font-bold text-2xs text-primary p-0 h-auto hover:bg-transparent"
                        >
                          <Link to={ROUTES.newContributionRequest(project.id)}>
                            <span>{t("home.owner.projects.newTask")}</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="xs"
                          className="gap-1 rounded-lg text-2xs font-bold border-border/80"
                        >
                          <Link to={ROUTES.ownerProject(project.id)}>
                            <span>{t("home.owner.projects.viewWorkspace")}</span>
                            <ActionArrow className="size-2.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Categories Navigation Strip */}
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">
                {isArabic ? "استكشاف المطورين حسب التخصص" : "Explore Contributors by Domain"}
              </h3>
              <Link to={ROUTES.explore} className="text-2xs font-bold text-primary hover:underline">
                {t("home.viewAll")}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((chip) => (
                <Link
                  key={chip.id}
                  to={ROUTES.explore}
                  className="rounded-xl border border-border/80 bg-surface-fog/50 px-3 py-1.5 text-xs font-bold text-foreground/80 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  {isArabic ? chip.labelAr : chip.labelEn}
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right / Sidebar Column (4 cols) ── */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Quick Owner Actions */}
          <section
            aria-labelledby="home-quick-actions-title"
            className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-border/70 pb-3.5">
              <Sparkles className="size-4.5 text-primary" />
              <h3 id="home-quick-actions-title" className="text-sm font-extrabold text-foreground">
                {t("home.owner.quickActions.title")}
              </h3>
            </div>

            <div className="space-y-2">
              {/* Action 1: New Project */}
              <Link
                to={ROUTES.newProject}
                className="group flex items-center justify-between rounded-xl border border-border/80 bg-surface-fog/40 p-3 text-start transition-all hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FilePlus2 className="size-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {t("home.owner.quickActions.launchProject")}
                    </h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {t("home.owner.quickActions.launchProjectDesc")}
                    </p>
                  </div>
                </div>
                <ActionArrow className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>

              {/* Action 2: GitHub Analysis */}
              <Link
                to={ROUTES.settings}
                search={{ section: "github" }}
                className="group flex items-center justify-between rounded-xl border border-border/80 bg-surface-fog/40 p-3 text-start transition-all hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-800 dark:text-slate-200">
                    <Github className="size-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {t("home.owner.quickActions.githubSync")}
                    </h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {t("home.owner.quickActions.githubSyncDesc")}
                    </p>
                  </div>
                </div>
                <ActionArrow className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>

              {/* Action 3: Find Talent */}
              <Link
                to={ROUTES.explore}
                className="group flex items-center justify-between rounded-xl border border-border/80 bg-surface-fog/40 p-3 text-start transition-all hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Users className="size-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {t("home.owner.quickActions.findTalent")}
                    </h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {t("home.owner.quickActions.findTalentDesc")}
                    </p>
                  </div>
                </div>
                <ActionArrow className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>

              {/* Action 4: Community Discussions */}
              <Link
                to={ROUTES.discussions}
                className="group flex items-center justify-between rounded-xl border border-border/80 bg-surface-fog/40 p-3 text-start transition-all hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <MessageSquare className="size-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {t("home.owner.quickActions.discussions")}
                    </h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {t("home.owner.quickActions.discussionsDesc")}
                    </p>
                  </div>
                </div>
                <ActionArrow className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </section>

          {/* Owner Workflow Guide */}
          <section
            aria-labelledby="home-guide-title"
            className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-border/70 pb-3.5">
              <BookOpen className="size-4.5 text-primary" />
              <h3 id="home-guide-title" className="text-sm font-extrabold text-foreground">
                {t("home.owner.guide.title")}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {t("home.owner.guide.step1Title")}
                  </h4>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {t("home.owner.guide.step1Desc")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {t("home.owner.guide.step2Title")}
                  </h4>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {t("home.owner.guide.step2Desc")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {t("home.owner.guide.step3Title")}
                  </h4>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {t("home.owner.guide.step3Desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Need Help Card */}
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-foreground">
              {t("home.needHelp")}
            </h4>
            <p className="text-2xs font-medium text-muted-foreground leading-relaxed">
              {t("home.supportDescription")}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl font-bold text-xs bg-card">
              <Link to={ROUTES.support}>
                {t("home.goToSupport")}
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
