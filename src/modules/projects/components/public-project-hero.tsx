import {
  Calendar,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  GitFork,
  Pencil,
  Share2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { API_BASE_URL } from "@/config/env";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { getCategoryLabel } from "./explore-filters";
import type { PublicProjectDetailDto } from "../types/public-project.types";

interface PublicProjectHeroProps {
  project: PublicProjectDetailDto;
  exploreHref: string;
  onApplyClick: () => void;
  onShareClick: () => void;
  onSaveClick: () => void;
  canSave: boolean;
  isSaved: boolean;
  isSavePending: boolean;
  proposalAction?: ReactNode;
  isOwner?: boolean;
  currentUserRole?: "owner" | "contributor" | "admin";
}

export function PublicProjectHero({
  project,
  exploreHref,
  onApplyClick,
  onShareClick,
  onSaveClick,
  canSave,
  isSaved,
  isSavePending,
  proposalAction,
  isOwner = false,
  currentUserRole,
}: PublicProjectHeroProps) {
  const { t } = useTranslation();

  // Derive repo owner handle or default
  const repoOwner =
    project.source.attributionStatus === "public"
      ? project.source.fullName.split("/")[0]
      : null;

  const categoryName = project.category
    ? getCategoryLabel(t, project.category)
    : t("common.notAvailable", "Not available");

  const technologies = project.technologies;

  const displayedTech = technologies.slice(0, 5);
  const remainingCount = Math.max(0, technologies.length - 5);
  const statistics =
    project.source.attributionStatus === "public"
      ? project.source.statistics
      : null;
  const updatedAt = statistics?.latestCommitAt ?? statistics?.sourceUpdatedAt;
  const heroImageUrl = resolveApiAssetUrl(project.heroImageUrl);

  return (
    <div className="space-y-4">
      {/* ── Breadcrumb & Top Actions Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumbs"
          className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm"
        >
          <a
            href={exploreHref}
            className="transition-colors hover:text-foreground"
          >
            {t("navigation.explore", "Discover Projects")}
          </a>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 rtl:rotate-180" />
          <span className="text-muted-foreground">{categoryName}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 rtl:rotate-180" />
          <span className="font-semibold text-foreground">{project.title}</span>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShareClick}
            className="h-9 gap-1.5 rounded-full border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-fog"
          >
            <Share2 className="size-3.5 text-muted-foreground" />
            <span>{t("project.detail.share", "Share")}</span>
          </Button>

          {canSave && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveClick}
              disabled={isSavePending}
              className="h-9 gap-1.5 rounded-full border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-fog"
            >
              {isSaved ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5 text-muted-foreground" />}
              <span>{t(isSaved ? "project.detail.saved" : "project.detail.save", isSaved ? "Saved" : "Save")}</span>
            </Button>
          )}

          {isOwner ? (
            <Button
              asChild
              size="sm"
              className="h-9 gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:bg-primary-hover active:scale-95"
            >
              <a href={ROUTES.ownerProject(project.id)}>
                <Pencil className="size-3.5" />
                <span>{t("project.detail.editProject", "Edit Project")}</span>
              </a>
            </Button>
          ) : currentUserRole !== "owner" ? (
            <Button
              type="button"
              size="sm"
              onClick={onApplyClick}
              className="h-9 gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:bg-primary-hover active:scale-95"
            >
              <Sparkles className="size-3.5" />
              <span>{t("project.detail.applyToProject", "Apply to Project")}</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* ── Main Hero Card ── */}
      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/25 via-slate-950 to-primary/5 text-4xl font-bold text-primary shadow-inner sm:aspect-[16/10] sm:w-[280px] lg:h-[180px] lg:w-[260px]">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt={t("project.detail.heroImageAlt", {
                  title: project.title,
                  defaultValue: "{{title}} hero image",
                })}
                className="size-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{project.title.slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          {/* Project Info Column */}
          <div className="flex min-w-0 flex-1 flex-col justify-between space-y-4">
            <div>
              {/* Title & Open Status Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[26px]">
                  {project.title}
                </h1>
                <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t("project.detail.statusOpen", "Open")}
                </span>
              </div>

              {/* Subtitle / Short Description */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-3">
                {project.description ?? t("explore.noDescription")}
              </p>

              {/* Technology Tags */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                {displayedTech.map((tech) => (
                  <span
                    key={tech}
                    dir="ltr"
                    className="rounded-full border border-border/70 bg-surface-fog px-2.5 py-1 font-mono text-[11.5px] font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span
                    dir="ltr"
                    className="rounded-full border border-border/70 bg-surface-fog px-2.5 py-1 font-mono text-[11.5px] font-medium text-muted-foreground"
                  >
                    +{remainingCount}
                  </span>
                )}
              </div>
            </div>

            {/* Owner & Organization Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {repoOwner && <span className="font-semibold text-foreground">@{repoOwner}</span>}
              </div>

              {project.source.attributionStatus === "public" && project.source.fetchedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-muted-foreground/70" />
                  <span>
                    {t("project.detail.lastFetched", "Last fetched:")} {new Date(project.source.fetchedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Key Metrics Horizontal Strip ── */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/80 pt-4 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-foreground">{statistics?.stars ?? 0}</span>
            <span className="text-muted-foreground">{t("project.detail.stars", "Stars")}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <GitFork className="size-4 text-primary" />
            <span className="font-bold text-foreground">{statistics?.forks ?? 0}</span>
            <span className="text-muted-foreground">{t("project.detail.forks", "Forks")}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Users className="size-4 text-primary" />
            <span className="font-bold text-foreground">{statistics?.contributors ?? "—"}</span>
            <span className="text-muted-foreground">
              {t("project.detail.contributors", "Contributors")}
            </span>
          </div>

          {updatedAt && (
            <div className="flex items-center gap-1.5 ms-auto font-medium text-muted-foreground">
            <Calendar className="size-3.5" />
              <span>
                {t("project.detail.updated", "Updated")} {new Date(updatedAt).toLocaleDateString()}
              </span>
          </div>
          )}
        </div>
      </section>

      {/* Optional proposal action banner if present */}
      {proposalAction && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          {proposalAction}
        </div>
      )}
    </div>
  );
}

function resolveApiAssetUrl(assetUrl: string | null): string | null {
  if (!assetUrl || !assetUrl.startsWith("/")) return assetUrl;
  return `${API_BASE_URL}${assetUrl}`;
}
