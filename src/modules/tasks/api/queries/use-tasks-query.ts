import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTaskDetails, getTasks } from "../../services/tasks.service";
import { tasksQueryKeys } from "../query-keys";
import type { TaskFeedFiltersDto } from "../../types/task.types";

export function useTasksQuery(filters: TaskFeedFiltersDto) {
  return useQuery({
    queryKey: tasksQueryKeys.feed(filters),
    queryFn: () => getTasks(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTaskDetailsQuery(taskId: string) {
  return useQuery({
    queryKey: tasksQueryKeys.details(taskId),
    queryFn: () => getTaskDetails(taskId),
    retry: false,
  });
}
