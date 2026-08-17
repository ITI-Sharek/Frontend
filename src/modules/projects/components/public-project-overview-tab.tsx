import { ExternalLink, FolderCode, Github } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { getCategoryLabel, getDifficultyLabel } from "./explore-filters";
import type { TaskItemData } from "./public-project-modals";
import type { PublicProjectDetailDto } from "../types/public-project.types";

interface PublicProjectOverviewTabProps {
  project: PublicProjectDetailDto;
  tasks: TaskItemData[];
  onViewTask: (task: TaskItemData) => void;
  materialsSlot?: ReactNode;
}

export function PublicProjectOverviewTab({
  project,
  tasks,
  onViewTask,
  materialsSlot,
}: PublicProjectOverviewTabProps) {
  const { t, i18n } = useTranslation();
  const publishedDate = new Date(project.publishedAt).toLocaleDateString(
    i18n.language,
    { year: "numeric", month: "short", day: "numeric" },
  );
  const categoryLabel = project.category
    ? getCategoryLabel(t, project.category)
    : t("common.notAvailable", "Not available");
  const difficultyLabel = project.difficulty
    ? getDifficultyLabel(t, project.difficulty)
    : t("common.notAvailable", "Not available");
  const sourceUpdatedAt =
    project.source.attributionStatus === "public"
      ? project.source.statistics.sourceUpdatedAt
      : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            {t("project.detail.aboutProject", "About This Project")}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {project.description ?? t("explore.noDescription")}
          </p>

          <div className="mt-6 border-t border-border/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("project.detail.projectRepo", "Project Repository")}
            </h3>
            {project.source.attributionStatus === "public" ? (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-fog p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Github className="size-4 shrink-0 text-foreground" />
                  <span dir="ltr" className="truncate font-mono text-xs font-medium text-foreground">
                    {project.source.fullName}
                  </span>
                </div>
                <a
                  dir="ltr"
                  href={project.source.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-fog"
                >
                  {t("project.detail.viewRepo", "View Repository")}
                  <ExternalLink className="size-3 text-muted-foreground" />
                </a>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("project.detail.sourceUnavailable", "Details about this project's source are not available to view right now.")}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            {t("project.detail.projectDetails", "Project Details")}
          </h2>
          <dl className="mt-4 divide-y divide-border/60 text-sm">
            <DetailRow label={t("project.detail.category", "Category")} value={categoryLabel} />
            <DetailRow label={t("project.detail.projectType", "Project Type")} value={t("project.detail.openSource", "Open Source")} />
            <DetailRow label={t("project.detail.difficulty", "Difficulty")} value={difficultyLabel} />
            <DetailRow label={t("project.detail.created", "Created")} value={publishedDate} />
            <DetailRow
              label={t("project.detail.lastUpdated", "Last Updated")}
              value={sourceUpdatedAt ? new Date(sourceUpdatedAt).toLocaleDateString(i18n.language) : t("common.notAvailable", "Not available")}
            />
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
        <h2 className="text-base font-bold text-foreground sm:text-lg">
          {t("project.detail.skillsRequired", "Technologies")}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.length > 0 ? project.technologies.map((technology) => (
            <span key={technology} dir="ltr" className="rounded-full border border-border/70 bg-surface-fog px-3 py-1.5 font-mono text-xs text-foreground">
              {technology}
            </span>
          )) : (
            <p className="text-sm text-muted-foreground">{t("common.notAvailable", "Not available")}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
        <h2 className="text-base font-bold text-foreground sm:text-lg">
          {t("project.detail.activeTasks", "Open Contribution Requests")} ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("project.detail.noOpenTasks", "No open Contribution Requests right now.")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <article key={task.id} className="flex flex-col gap-4 rounded-xl border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FolderCode className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground sm:text-base">{task.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span key={tag} dir="ltr" className="rounded-full border border-border/70 bg-surface-fog px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-xs">
                    <p className="text-muted-foreground">{t("project.detail.reward", "Reward")}</p>
                    <p className="font-bold text-foreground">{task.reward}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => onViewTask(task)} className="rounded-lg text-xs font-semibold">
                    {t("project.detail.viewTask", "View")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {materialsSlot && (
        <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] sm:p-6">
          {materialsSlot}
        </section>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end font-medium text-foreground">{value}</dd>
    </div>
  );
}
