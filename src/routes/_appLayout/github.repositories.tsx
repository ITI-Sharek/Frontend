import { createFileRoute } from "@tanstack/react-router";

import {
  ContributorGitHubRepositoriesPage,
  startGitHubConnect,
} from "@/modules/github";

export const CONTRIBUTOR_GITHUB_REPOSITORIES_PATH = "/github/repositories";

export const Route = createFileRoute("/_appLayout/github/repositories")({
  head: () => ({
    meta: [{ title: "مستودعات GitHub | Sharek" }],
  }),
  component: ContributorGitHubRepositoriesRoute,
});

function ContributorGitHubRepositoriesRoute() {
  return (
    <ContributorGitHubRepositoriesPage
      returnTo={CONTRIBUTOR_GITHUB_REPOSITORIES_PATH}
      onConnectGitHub={(returnTo) => {
        void startGitHubConnect(returnTo);
      }}
    />
  );
}
