import {
  FolderCode,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { TaskItemData } from "./public-project-modals";

interface PublicProjectTasksTabProps {
  tasks: TaskItemData[];
  onViewTask: (task: TaskItemData) => void;
  onApplyToTask: (task: TaskItemData) => void;
}

export function PublicProjectTasksTab({
  tasks,
  onViewTask,
  onApplyToTask,
}: PublicProjectTasksTabProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      task.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === "all") return true;
    return task.difficulty === filter;
  });

  return (
    <div className="space-y-6">
      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-[var(--shadow-record)] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("project.tasks.searchPlaceholder", "Search tasks by title, skill, or keyword...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilter(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === level
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-fog text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {level === "all" ? t("common.all", "All Tasks") : level}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tasks Grid ── */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-card p-10 text-center text-sm text-muted-foreground">
            {t("project.tasks.noTasksFound", "No tasks match your search filters.")}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-record)] transition-all hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderCode className="size-5" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm sm:text-base">
                      {task.title}
                    </h3>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {task.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground sm:text-sm line-clamp-2">
                    {task.description ?? t("project.detail.taskDescriptionUnavailable", "Open this Contribution Request to view its full description.")}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 bg-surface-fog px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task Meta and Actions */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end sm:self-center shrink-0 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
                <div className="text-center sm:text-start">
                  <span className="text-[11px] text-muted-foreground">
                    {t("project.detail.dueDate", "Due Date")}
                  </span>
                  <p className="text-xs font-bold text-foreground">{task.dueDate}</p>
                </div>

                <div className="text-center sm:text-start">
                  <span className="text-[11px] text-muted-foreground">
                    {t("project.detail.reward", "Reward")}
                  </span>
                  <p className="text-sm font-extrabold text-foreground">{task.reward}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTask(task)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    {t("project.detail.viewTask", "View Task")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onApplyToTask(task)}
                    className="rounded-xl text-xs font-bold gap-1"
                  >
                    <Sparkles className="size-3.5" />
                    {t("project.detail.applyToProject", "Apply")}
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
