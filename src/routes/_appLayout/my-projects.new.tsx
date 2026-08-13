import { createFileRoute } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

import { requireMemberRoute } from "@/modules/auth";
import { useGitHubRepositoriesQuery } from "@/modules/github";
import { ImportProjectStepper } from "@/modules/projects";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

export const Route = createFileRoute("/_appLayout/my-projects/new")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ImportProjectPage,
});

/**
 * Composes the `github` module (connected-repo shortcuts) with the
 * `projects` module (preview/draft flow) here at the route level, so
 * neither module imports the other.
 */
function ImportProjectPage() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate();
  const repositoriesQuery = useGitHubRepositoriesQuery({ perPage: 8 });

  const suggestedRepositories = (repositoriesQuery.data?.items ?? []).map(
    (repo) => ({
      fullName: repo.fullName,
      description: repo.description,
      isPrivate: repo.private,
    }),
  );

  const isAccountNotConnected =
    isAxiosError(repositoriesQuery.error) &&
    repositoriesQuery.error.response?.data?.code ===
      "GITHUB_ACCOUNT_NOT_CONNECTED";

  return (
    <ImportProjectStepper
      onDraftCreated={(projectId) => {
        void navigate({ to: `/my-projects/${encodeURIComponent(projectId)}` });
      }}
      suggestedRepositories={suggestedRepositories}
      suggestedRepositoriesLoading={repositoriesQuery.isPending}
      suggestedRepositoriesError={
        repositoriesQuery.isError && !isAccountNotConnected
          ? getApiErrorMessage(
              repositoriesQuery.error,
              t("importProject.loadRepositoriesError"),
            )
          : null
      }
    />
  );
}
