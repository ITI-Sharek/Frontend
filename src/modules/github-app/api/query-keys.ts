export const githubAppKeys = {
  all: ["github-app"] as const,
  installations: () => [...githubAppKeys.all, "installations"] as const,
  connectionAttempt: (attemptId: string) =>
    [...githubAppKeys.all, "connection-attempt", attemptId] as const,
  repositories: (installationLinkId: string, page: number, perPage: number) =>
    [
      ...githubAppKeys.all,
      "repositories",
      installationLinkId,
      page,
      perPage,
    ] as const,
};
