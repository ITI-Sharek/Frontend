import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGitHubRepositoryStatistics } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubRepositoryStatisticsQueryOptions({
  fullName,
  enabled = true,
}: {
  fullName: string;
  enabled?: boolean;
}) {
  const normalizedFullName = fullName.trim();

  return queryOptions({
    queryKey: githubKeys.repositoryStatistics(normalizedFullName),
    queryFn: () => getGitHubRepositoryStatistics(normalizedFullName),
    enabled: enabled && normalizedFullName.length > 0,
  });
}

export function useGitHubRepositoryStatisticsQuery({
  fullName,
  enabled = true,
}: {
  fullName: string;
  enabled?: boolean;
}) {
  return useQuery(githubRepositoryStatisticsQueryOptions({ fullName, enabled }));
}
