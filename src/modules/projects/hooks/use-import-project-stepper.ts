import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";

import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

import { useCreateProjectDraftMutation } from "../api/mutations/use-create-project-draft-mutation";
import { usePreviewGitHubRepositoryMutation } from "../api/mutations/use-preview-github-repository-mutation";
import { usePublishProjectMutation } from "../api/mutations/use-publish-project-mutation";
import { useUploadProjectHeroImageMutation } from "../api/mutations/use-upload-project-hero-image-mutation";
import type {
  ImportProjectStepperProps,
  QueuedMaterial,
} from "../schemas/import-project-stepper.schema";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../types/project.types";
import {
  buildQueuedMaterials,
  filterSuggestedRepositories,
  isHeroImageSelectionValid,
} from "../utils/import-project-stepper.helpers";
import {
  initialImportProjectStepperState,
  importProjectStepperReducer,
} from "../utils/import-project-stepper.machine";
import {
  getProjectApiErrorMessage,
  isPreviewStaleError,
} from "../utils/project-error-presenter";
import { parseFieldList } from "../utils/project-field-list";

/**
 * Owns all wizard state for the project-import stepper: one reducer for
 * progress and form fields, TanStack Query mutations for server I/O, and the
 * side-effectful handlers (object URLs, idempotency keys, clipboard) that must
 * stay out of the pure reducer.
 */
export function useImportProjectStepper({
  onDraftCreated,
  onProjectPublished,
  onUploadMaterials,
  suggestedRepositories = [],
}: ImportProjectStepperProps) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(
    importProjectStepperReducer,
    initialImportProjectStepperState,
  );

  const previewMutation = usePreviewGitHubRepositoryMutation();
  const createDraftMutation = useCreateProjectDraftMutation();
  const publishMutation = usePublishProjectMutation();
  const uploadHeroImageMutation = useUploadProjectHeroImageMutation();

  useEffect(() => {
    return () => {
      if (state.heroImagePreview) URL.revokeObjectURL(state.heroImagePreview);
    };
  }, [state.heroImagePreview]);

  const selectedTechs = parseFieldList(state.technologies);
  const filteredSuggestedRepos = filterSuggestedRepositories(
    suggestedRepositories,
    state.repoSearch,
  );

  function setReference(value: string) {
    dispatch({ type: "referenceChanged", value });
  }

  function setRepoSearch(value: string) {
    dispatch({ type: "repoSearchChanged", value });
  }

  function setTitle(value: string) {
    dispatch({ type: "titleChanged", value });
  }

  function setDescription(value: string) {
    dispatch({ type: "descriptionChanged", value });
  }

  function setCategory(value: ProjectCategory) {
    dispatch({ type: "categoryChanged", value });
  }

  function setDifficulty(value: ProjectDifficulty) {
    dispatch({ type: "difficultyChanged", value });
  }

  function setNewTechInput(value: string) {
    dispatch({ type: "newTechInputChanged", value });
  }

  function toggleTechnology(technology: string) {
    dispatch({ type: "technologyToggled", technology });
  }

  function addCustomTechnology() {
    dispatch({ type: "customTechnologySubmitted" });
  }

  function handlePreview(referenceValue: string) {
    const trimmed = referenceValue.trim();
    if (trimmed === "") return;
    dispatch({ type: "previewStarted", reference: trimmed });
    previewMutation.mutate(
      { repositoryReference: trimmed },
      {
        onSuccess: (result) => {
          dispatch({
            type: "previewSucceeded",
            result,
            draftIdempotencyKey: createIdempotencyKey(),
          });
        },
      },
    );
  }

  function handleAddFiles(files: FileList | null) {
    dispatch({
      type: "materialsAdded",
      materials: buildQueuedMaterials(files),
    });
  }

  function handleHeroImageChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isHeroImageSelectionValid(file)) {
      dispatch({
        type: "heroImageRejected",
        errorMessage: t(
          "project.import.heroImageInvalid",
          "Choose a PNG, JPEG, or WebP image no larger than 5 MB.",
        ),
      });
      return;
    }
    dispatch({
      type: "heroImageSelected",
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }

  function handleRemoveMaterial(id: string) {
    dispatch({ type: "materialRemoved", id });
  }

  function handleUpdateMaterial(id: string, updates: Partial<QueuedMaterial>) {
    dispatch({ type: "materialUpdated", id, updates });
  }

  function goToStep(step: number) {
    dispatch({ type: "stepChanged", step });
  }

  async function executeSave(shouldPublish: boolean) {
    if (state.preview === null || state.draftIdempotencyKey === null) return;
    dispatch({ type: "saveStarted" });

    try {
      let project = state.createdDraft;
      if (!project) {
        project = await createDraftMutation.mutateAsync({
          idempotencyKey: state.draftIdempotencyKey,
          source: {
            provider: "github",
            repositoryReference: state.reference,
            previewFingerprint: state.preview.previewFingerprint,
          },
          project: {
            title: state.title,
            description:
              state.description.trim() === "" ? null : state.description,
            tags: parseFieldList(state.tags),
            technologies: parseFieldList(state.technologies),
            category: state.category,
            difficulty: state.difficulty,
          },
        });
        dispatch({ type: "draftCreated", project });
      }

      if (state.heroImage && state.uploadedHeroImage !== state.heroImage) {
        project = await uploadHeroImageMutation.mutateAsync({
          projectId: project.id,
          expectedRevision: project.revision,
          file: state.heroImage,
          idempotencyKey: createIdempotencyKey(),
        });
        dispatch({
          type: "heroImageUploaded",
          project,
          file: state.heroImage,
        });
      }

      if (state.queuedMaterials.length > 0 && onUploadMaterials) {
        try {
          await onUploadMaterials(project.id, state.queuedMaterials);
        } catch (matErr) {
          console.error("Material upload warning:", matErr);
        }
      }

      if (shouldPublish) {
        await publishMutation.mutateAsync({
          projectId: project.id,
          idempotencyKey: createIdempotencyKey(),
          expectedRevision: project.revision,
          confirm: true,
        });

        dispatch({
          type: "publishSucceeded",
          project: { id: project.id, slug: project.slug },
        });
        if (onProjectPublished) {
          onProjectPublished(project.id, project.slug);
        }
      } else {
        onDraftCreated(project.id);
      }
    } catch (err) {
      dispatch({
        type: "saveFailed",
        errorMessage: getProjectApiErrorMessage(t, err),
        previewStale: isPreviewStaleError(err),
      });
    } finally {
      dispatch({ type: "saveFinished" });
    }
  }

  function handleCopyProjectLink() {
    const published = state.publishedProject;
    if (!published) return;
    void navigator.clipboard.writeText(
      `${window.location.origin}/projects/${published.slug}`,
    );
    dispatch({ type: "linkCopied" });
    setTimeout(() => dispatch({ type: "linkCopyReset" }), 2000);
  }

  function handlePublishedModalOpenChange(open: boolean) {
    if (!open && state.publishedProject) {
      onDraftCreated(state.publishedProject.id);
    }
  }

  return {
    state,
    previewMutation,
    selectedTechs,
    filteredSuggestedRepos,
    setReference,
    setRepoSearch,
    setTitle,
    setDescription,
    setCategory,
    setDifficulty,
    setNewTechInput,
    toggleTechnology,
    addCustomTechnology,
    handlePreview,
    handleAddFiles,
    handleHeroImageChange,
    handleRemoveMaterial,
    handleUpdateMaterial,
    goToStep,
    executeSave,
    handleCopyProjectLink,
    handlePublishedModalOpenChange,
  };
}

export type ImportProjectStepperController = ReturnType<
  typeof useImportProjectStepper
>;
