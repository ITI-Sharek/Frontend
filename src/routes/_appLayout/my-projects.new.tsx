import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { requireMemberRoute } from "@/modules/auth";
import { useContributorFieldsQuery } from "@/modules/contributors";
import {
  resolveSelectedInstallationLinkId,
  useGitHubAppInstallationsQuery,
  useGitHubAppRepositoriesQuery,
} from "@/modules/github-app";
import {
  ImportProjectStepper,
  useProjectCategoriesQuery,
  useProjectDifficultiesQuery,
} from "@/modules/projects";
import { uploadProjectMaterial } from "@/modules/materials/services/materials.service";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { ROUTES } from "@/config/routes.config";

export const Route = createFileRoute("/_appLayout/my-projects/new")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ImportProjectPage,
});

/**
 * Composes the `github-app` module (selected-repository shortcuts),
 * `materials` module (material uploads), `contributors` module (taxonomy),
 * and `projects` module (wizard) here at the route level, preserving strict
 * modular boundaries.
 */
function ImportProjectPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const navigate = Route.useNavigate();
  const installationsQuery = useGitHubAppInstallationsQuery();
  const categoriesQuery = useProjectCategoriesQuery();
  const fieldsQuery = useContributorFieldsQuery();
  const difficultiesQuery = useProjectDifficultiesQuery();

  const dynamicCategories = useMemo(() => {
    const map = new Map<string, { key: string; labelAr: string; labelEn: string }>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.key, category);
    }
    return Array.from(map.values()).map((cat) => ({
      id: cat.key,
      label: isArabic ? cat.labelAr : cat.labelEn,
    }));
  }, [categoriesQuery.data, isArabic]);

  const dynamicTechnologies = useMemo(() =>
    (fieldsQuery.data ?? []).map((field) => field.labelEn || field.key),
  [fieldsQuery.data]);

  const dynamicDifficulties = useMemo(() => {
    return (difficultiesQuery.data ?? []).map((difficulty) => ({
      id: difficulty.key,
      label: isArabic ? difficulty.labelAr : difficulty.labelEn,
    }));
  }, [difficultiesQuery.data, isArabic]);

  const installationLinkId = resolveSelectedInstallationLinkId(
    installationsQuery.data ?? [],
    null,
  );
  const repositoriesQuery = useGitHubAppRepositoriesQuery({
    installationLinkId: installationLinkId ?? "",
    perPage: 8,
    enabled: installationLinkId !== null,
  });

  const suggestedRepositories = (repositoriesQuery.data?.items ?? []).map(
    (repo) => ({
      fullName: repo.fullName,
      description: null,
      isPrivate: repo.visibility === "private",
    }),
  );
  const repositoriesError = repositoriesQuery.isError
    ? getApiErrorMessage(
        repositoriesQuery.error,
        t("importProject.loadRepositoriesError"),
      )
    : null;

  return (
    <ImportProjectStepper
      onDraftCreated={(projectId) => {
        void navigate({ to: `/my-projects/${encodeURIComponent(projectId)}` });
      }}
      onUploadMaterials={async (projectId, materials) => {
        for (const mat of materials) {
          await uploadProjectMaterial(projectId, {
            file: mat.file,
            title: mat.title,
            visibility: mat.visibility,
            idempotencyKey: createIdempotencyKey(),
          });
        }
      }}
      categories={dynamicCategories}
      technologies={dynamicTechnologies}
      difficulties={dynamicDifficulties}
      suggestedRepositories={suggestedRepositories}
      suggestedRepositoriesLoading={
        installationsQuery.isPending ||
        (installationLinkId !== null && repositoriesQuery.isPending)
      }
      suggestedRepositoriesError={repositoriesError}
      needsGitHubConnection={
        installationsQuery.isSuccess && installationLinkId === null
      }
      onConnectGitHub={() => {
        void navigate({ to: ROUTES.githubSkillAnalysis });
      }}
    />
  );
}
