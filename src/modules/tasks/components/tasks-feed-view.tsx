import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import { useTasksQuery } from "../api/queries/use-tasks-query";
import { TaskCard } from "./task-card";
import type { ProjectDifficulty, TaskFeedFiltersDto } from "../types/task.types";

const DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as ProjectDifficulty[];

interface TasksFeedViewProps {
  filters: TaskFeedFiltersDto;
  onFiltersChange: (partial: Partial<TaskFeedFiltersDto>) => void;
  onReset: () => void;
}

/**
 * CJ-2 task feed: "which work item now?" — pill filters (tech, difficulty,
 * reward), search, uniform cards with explained fit.
 */
export function TasksFeedView({
  filters,
  onFiltersChange,
  onReset,
}: TasksFeedViewProps) {
  const tasksQuery = useTasksQuery(filters);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");
  const result = tasksQuery.data;
  const selectedTech = filters.technologies ?? [];
  const hasFilters =
    selectedTech.length > 0 ||
    filters.difficulty !== undefined ||
    filters.hasReward === true ||
    (filters.q ?? "") !== "";

  function toggleTechnology(tech: string) {
    const next = selectedTech.includes(tech)
      ? selectedTech.filter((item) => item !== tech)
      : [...selectedTech, tech];
    onFiltersChange({ technologies: next.length > 0 ? next : undefined });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">المهام</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        اختر مهمة تستحق إحدى محاولاتك المحدودة اليوم — التوافق مُفسَّر قبل
        التقديم.
      </p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          onFiltersChange({ q: searchDraft.trim() || undefined });
        }}
      >
        <label className="flex items-center gap-2.5 rounded-input border border-border bg-card px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="ابحث بعنوان المهمة أو المشروع أو التقنية…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-input-placeholder"
          />
          {searchDraft !== "" && (
            <button
              type="button"
              aria-label="مسح البحث"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchDraft("");
                onFiltersChange({ q: undefined });
              }}
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(result?.technologyFacets ?? []).map((tech) => (
          <button
            key={tech}
            type="button"
            dir="ltr"
            onClick={() => toggleTechnology(tech)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-[0.65px] transition-colors",
              selectedTech.includes(tech)
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {tech}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {DIFFICULTIES.map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() =>
              onFiltersChange({
                difficulty:
                  filters.difficulty === difficulty ? undefined : difficulty,
              })
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              filters.difficulty === difficulty
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              hasReward: filters.hasReward === true ? undefined : true,
            })
          }
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            filters.hasReward === true
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          بمكافأة
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchDraft("");
              onReset();
            }}
            className="text-xs text-primary hover:opacity-80"
          >
            مسح الكل
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-foreground">
        <b>{result?.totalCount ?? "…"}</b> مهام متاحة
      </p>

      {tasksQuery.isPending ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-card border border-border bg-card p-5">
              <div className="h-3.5 w-3/5 rounded bg-border/50" />
              <div className="mt-3 h-3 w-2/5 rounded bg-border/40" />
              <div className="mt-4 h-3 w-full rounded bg-border/30" />
            </div>
          ))}
        </div>
      ) : result !== undefined && result.tasks.length > 0 ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-card border border-dashed border-border bg-card p-10 text-center">
          <p className="font-bold text-foreground">لا توجد مهام تطابق هذه الفلاتر</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            جرّب توسيع البحث أو إزالة فلتر.
          </p>
          <Button size="sm" variant="outline" className="mt-4" onClick={onReset}>
            إعادة تعيين
          </Button>
        </div>
      )}
    </div>
  );
}
