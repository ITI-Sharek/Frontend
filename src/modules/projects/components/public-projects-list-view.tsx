import { ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "./explore-filters";
import type {
  PublicProjectListItemDto,
  PublicProjectsListResponseDto,
} from "../types/public-project.types";

export function PublicProjectsListView({
  projects,
  pageInfo,
  onLoadMore,
  isLoadingMore,
}: {
  projects: PublicProjectListItemDto[];
  pageInfo: PublicProjectsListResponseDto["pageInfo"];
  onLoadMore?: () => void;
  isLoadingMore: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary" dir="ltr">
          Published projects
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">المشاريع المنشورة</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          مشاريع راجع أصحابها بياناتها ونشروها صراحةً على Sharek.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا توجد مشاريع منشورة حالياً.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-card border border-border bg-card p-5">
              <div className="flex flex-wrap items-start gap-2">
                <h2 className="min-w-0 flex-1 font-mono text-lg font-bold tracking-[0.04em] text-foreground" dir="ltr">
                  <a href={`/projects/${encodeURIComponent(project.slug)}`} className="hover:text-primary">
                    {project.title}
                  </a>
                </h2>
                {project.difficulty && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {DIFFICULTY_LABELS[project.difficulty]}
                  </span>
                )}
                {project.category && (
                  <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                    {CATEGORY_LABELS[project.category]}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                {project.description ?? "لا يوجد وصف لهذا المشروع بعد."}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 6).map((technology) => (
                  <span key={technology} className="rounded-full bg-border/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {technology}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <a href={`/projects/${encodeURIComponent(project.slug)}`} className="text-sm font-semibold text-primary">
                  عرض المشروع
                </a>
                {project.source.attributionStatus === "public" && (
                  <a href={project.source.repositoryUrl} target="_blank" rel="noreferrer" aria-label={`فتح ${project.source.fullName} على GitHub`} className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pageInfo.hasNextPage && onLoadMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" disabled={isLoadingMore} onClick={onLoadMore}>
            {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
            تحميل المزيد
          </Button>
        </div>
      )}
    </div>
  );
}
