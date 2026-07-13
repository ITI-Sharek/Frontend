import type { TaskFeedFiltersDto } from "../types/task.types";

export const tasksQueryKeys = {
  all: ["tasks"] as const,
  feed: (filters: TaskFeedFiltersDto) =>
    [...tasksQueryKeys.all, "feed", filters] as const,
  details: (taskId: string) =>
    [...tasksQueryKeys.all, "details", taskId] as const,
};
