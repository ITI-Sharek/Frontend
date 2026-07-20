import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import {
  ContributorGitHubRepositoriesPage,
  startGitHubConnect,
} from "@/modules/github";

export const CONTRIBUTOR_GITHUB_REPOSITORIES_PATH = "/github/repositories";

export const Route = createFileRoute("/_appLayout/github/repositories")({
  beforeLoad: requireContributorRoute,
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
