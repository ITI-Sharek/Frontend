import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import { TasksFeedView } from "@/modules/tasks";
import type { ProjectDifficulty, TaskFeedFiltersDto } from "@/modules/tasks";

const DIFFICULTIES: ProjectDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** Filters live in the URL (shareable, back-navigable) — same as /explore. */
function validateSearch(search: Record<string, unknown>): TaskFeedFiltersDto {
  const filters: TaskFeedFiltersDto = {};
  if (typeof search.q === "string" && search.q.trim() !== "") {
    filters.q = search.q;
  }
  const tech = search.technologies;
  if (typeof tech === "string") {
    filters.technologies = [tech];
  } else if (
    Array.isArray(tech) &&
    tech.every((item): item is string => typeof item === "string") &&
    tech.length > 0
  ) {
    filters.technologies = tech;
  }
  if (DIFFICULTIES.includes(search.difficulty as ProjectDifficulty)) {
    filters.difficulty = search.difficulty as ProjectDifficulty;
  }
  if (search.hasReward === true || search.hasReward === "true") {
    filters.hasReward = true;
  }
  return filters;
}

export const Route = createFileRoute("/_appLayout/tasks/")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "المهام | Sharek" }] }),
  validateSearch,
  component: TasksPage,
});

function TasksPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <TasksFeedView
      filters={filters}
      onFiltersChange={(partial) =>
        void navigate({
          search: { ...filters, ...partial },
          replace: true,
        })
      }
      onReset={() => void navigate({ search: {}, replace: true })}
    />
  );
}
