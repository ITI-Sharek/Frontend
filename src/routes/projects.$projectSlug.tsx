import { Link, createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { useCurrentUserQuery } from "@/modules/auth";
import {
  getApplicationDailyLimitResetCopy,
  getApplicationSubmissionErrorMessage,
  useContributionRequestsQuery,
  useSubmitApplicationMutation,
} from "@/modules/contribution-requests";
import { MaterialsPanel, useProjectMaterialsQuery } from "@/modules/materials";
import {
  PublicProjectDetailView,
  getProjectApiErrorMessage,
  usePublicProjectBySlugQuery
} from "@/modules/projects";
import type {ApplicationSubmissionController} from "@/modules/projects";
import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

import { PublicProjectsShell } from "./-public-projects-shell";

export const Route = createFileRoute("/projects/$projectSlug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.projectSlug} | Sharek` }],
  }),
  component: PublicProjectDetailsPage,
});

function PublicProjectDetailsPage() {
  const { t, i18n } = useTranslation();
  const { projectSlug } = Route.useParams();
  const projectQuery = usePublicProjectBySlugQuery(projectSlug);
  const currentUserQuery = useCurrentUserQuery();
  const contributionRequestsQuery = useContributionRequestsQuery();
  const submitApplication = useSubmitApplicationMutation();
  const canReadMaterials = currentUserQuery.data?.status === "active";
  const materialsQuery = useProjectMaterialsQuery(
    projectQuery.data?.id ?? "",
    canReadMaterials,
  );

  if (projectQuery.isPending) {
    return (
      <PublicProjectsShell>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          {t("project.loading")}
        </div>
      </PublicProjectsShell>
    );
  }

  if (projectQuery.isError) {
    return (
      <PublicProjectsShell>
        <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-foreground">
            {t("project.errors.projectNotFound")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getProjectApiErrorMessage(t, projectQuery.error)}
          </p>
          <Link to={ROUTES.publicProjects} className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {t("proposalSubmission.backToProjects")}
          </Link>
        </div>
      </PublicProjectsShell>
    );
  }

  const currentUser = currentUserQuery.data;
  const isOwner =
    currentUser?.role === "owner" &&
    (!projectQuery.data.owner?.username ||
      currentUser.username === projectQuery.data.owner.username);

  const submissionErrorCode = getApiErrorCode(submitApplication.error);
  const applicationSubmission: ApplicationSubmissionController = {
    submit: (payload, handlers) =>
      submitApplication.mutate(payload, {
        onSuccess: handlers?.onSuccess ? () => handlers.onSuccess?.() : undefined,
      }),
    reset: () => submitApplication.reset(),
    isPending: submitApplication.isPending,
    hasError: submitApplication.error !== null,
    errorCode: submissionErrorCode,
    submissionErrorMessage: submitApplication.error
      ? getApplicationSubmissionErrorMessage(submitApplication.error)
      : null,
    dailyLimitResetCopy:
      submissionErrorCode === "APPLICATION_DAILY_LIMIT_REACHED" &&
      submitApplication.error
        ? getApplicationDailyLimitResetCopy(submitApplication.error, i18n.language)
        : null,
  };

  return (
    <PublicProjectsShell>
      <PublicProjectDetailView
        project={projectQuery.data}
        exploreHref={ROUTES.publicProjects}
        isOwner={isOwner}
        currentUserRole={currentUser?.role}
        projectRequests={contributionRequestsQuery.data?.items ?? []}
        applicationSubmission={applicationSubmission}
        isAuthenticated={Boolean(currentUser && currentUser.status === "active")}
        isContributor={currentUser?.role === "contributor"}
        isAuthLoading={currentUserQuery.isLoading}
        proposalAction={
          currentUser?.role === "contributor" &&
          currentUser.status === "active" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {t("project.detail.newIdeaTitle")}
                </h2>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {t("project.detail.newIdeaDescription")}
                </p>
              </div>
              <Link
                to={ROUTES.newProposal}
                search={{
                  projectId: projectQuery.data.id,
                  projectName: projectQuery.data.title,
                }}
                className="rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                {t("project.detail.submitContributionProposal")}
              </Link>
            </div>
          ) : null
        }
        materialsSlot={
          canReadMaterials ? (
            <MaterialsPanel
              scope={{ kind: "project", id: projectQuery.data.id }}
              isOwner={false}
              materials={materialsQuery.data}
              isLoading={materialsQuery.isPending}
              isError={materialsQuery.isError}
            />
          ) : null
        }
        canSave={currentUser?.status === "active"}
      />
    </PublicProjectsShell>
  );
}
