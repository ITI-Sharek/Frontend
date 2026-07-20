import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import { ROUTES } from "@/config/routes.config";
import { TaskDetailsView, useTaskDetailsQuery } from "@/modules/tasks";
import type { TaskApplicationState } from "@/modules/tasks";

const APPLICATION_STATES: TaskApplicationState[] = [
  "open",
  "already_applied",
  "assigned",
  "quota_exhausted",
  "profile_not_approved",
];

interface TaskDetailsSearch {
  /** Dev/demo switch while the API is mocked: preview the gate states. */
  state?: TaskApplicationState;
}

export const Route = createFileRoute("/_appLayout/tasks/$taskId")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "تفاصيل المهمة | Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): TaskDetailsSearch =>
    APPLICATION_STATES.includes(search.state as TaskApplicationState)
      ? { state: search.state as TaskApplicationState }
      : {},
  component: TaskDetailsPage,
});

function TaskDetailsPage() {
  const { taskId } = Route.useParams();
  const { state } = Route.useSearch();
  const taskQuery = useTaskDetailsQuery(taskId);

  if (taskQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل المهمة...</p>
      </div>
    );
  }

  if (taskQuery.data === undefined) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">
          لم نعثر على هذه المهمة
        </h1>
        <a
          href="/tasks"
          className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          العودة إلى المهام
        </a>
      </div>
    );
  }

  const task =
    state === undefined
      ? taskQuery.data
      : { ...taskQuery.data, applicationState: state };

  return (
    <TaskDetailsView
      task={task}
      tasksHref="/tasks"
      projectHref={`/projects/${task.projectSlug}`}
    />
  );
}
