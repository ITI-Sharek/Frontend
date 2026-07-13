import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGitHubRepositoryCommitSignals } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubRepositoryCommitSignalsQueryOptions({
  fullName,
  author,
  enabled = true,
}: {
  fullName: string;
  author?: string;
  enabled?: boolean;
}) {
  const normalizedFullName = fullName.trim();
  const normalizedAuthor = author?.trim() || undefined;

  return queryOptions({
    queryKey: githubKeys.repositoryCommitSignals(
      normalizedFullName,
      normalizedAuthor,
    ),
    queryFn: () =>
      getGitHubRepositoryCommitSignals({
        fullName: normalizedFullName,
        author: normalizedAuthor,
      }),
    enabled: enabled && normalizedFullName.length > 0,
  });
}

export function useGitHubRepositoryCommitSignalsQuery({
  fullName,
  author,
  enabled = true,
}: {
  fullName: string;
  author?: string;
  enabled?: boolean;
}) {
  return useQuery(
    githubRepositoryCommitSignalsQueryOptions({ fullName, author, enabled }),
  );
}
