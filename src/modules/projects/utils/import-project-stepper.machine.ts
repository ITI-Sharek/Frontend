import type {
  PreviewGitHubRepositoryResponseDto,
  ProjectOwnerViewDto,
} from "../types/project-draft.types";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../types/project.types";
import type {
  PublishedProject,
  QueuedMaterial,
} from "../schemas/import-project-stepper.schema";
import { formatFieldList, parseFieldList } from "./project-field-list";

export const IMPORT_PROJECT_STEP_COUNT = 4;

export interface ImportProjectStepperState {
  /** 1: Repo, 2: Details & Identity, 3: Materials, 4: Launch */
  currentStep: number;
  reference: string;
  repoSearch: string;
  preview: PreviewGitHubRepositoryResponseDto | null;
  draftIdempotencyKey: string | null;
  createdDraft: ProjectOwnerViewDto | null;
  title: string;
  description: string;
  tags: string;
  technologies: string;
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  newTechInput: string;
  heroImage: File | null;
  uploadedHeroImage: File | null;
  heroImagePreview: string | null;
  queuedMaterials: QueuedMaterial[];
  isSubmitting: boolean;
  submitError: string | null;
  publishedProject: PublishedProject | null;
  copiedLink: boolean;
}

export type ImportProjectStepperAction =
  | { type: "referenceChanged"; value: string }
  | { type: "repoSearchChanged"; value: string }
  | { type: "titleChanged"; value: string }
  | { type: "descriptionChanged"; value: string }
  | { type: "categoryChanged"; value: ProjectCategory }
  | { type: "difficultyChanged"; value: ProjectDifficulty }
  | { type: "newTechInputChanged"; value: string }
  | { type: "technologyToggled"; technology: string }
  | { type: "customTechnologySubmitted" }
  | { type: "previewStarted"; reference: string }
  | {
      type: "previewSucceeded";
      result: PreviewGitHubRepositoryResponseDto;
      draftIdempotencyKey: string;
    }
  | { type: "heroImageSelected"; file: File; previewUrl: string }
  | { type: "heroImageRejected"; errorMessage: string }
  | { type: "materialsAdded"; materials: QueuedMaterial[] }
  | { type: "materialRemoved"; id: string }
  | { type: "materialUpdated"; id: string; updates: Partial<QueuedMaterial> }
  | { type: "saveStarted" }
  | { type: "draftCreated"; project: ProjectOwnerViewDto }
  | { type: "heroImageUploaded"; project: ProjectOwnerViewDto; file: File }
  | { type: "publishSucceeded"; project: PublishedProject }
  | { type: "saveFailed"; errorMessage: string; previewStale: boolean }
  | { type: "saveFinished" }
  | { type: "stepChanged"; step: number }
  | { type: "linkCopied" }
  | { type: "linkCopyReset" };

export const initialImportProjectStepperState: ImportProjectStepperState = {
  currentStep: 1,
  reference: "",
  repoSearch: "",
  preview: null,
  draftIdempotencyKey: null,
  createdDraft: null,
  title: "",
  description: "",
  tags: "",
  technologies: "",
  category: null,
  difficulty: "intermediate",
  newTechInput: "",
  heroImage: null,
  uploadedHeroImage: null,
  heroImagePreview: null,
  queuedMaterials: [],
  isSubmitting: false,
  submitError: null,
  publishedProject: null,
  copiedLink: false,
};

export function importProjectStepperReducer(
  state: ImportProjectStepperState,
  action: ImportProjectStepperAction,
): ImportProjectStepperState {
  switch (action.type) {
    case "referenceChanged":
      return { ...state, reference: action.value };
    case "repoSearchChanged":
      return { ...state, repoSearch: action.value };
    case "titleChanged":
      return { ...state, title: action.value };
    case "descriptionChanged":
      return { ...state, description: action.value };
    case "categoryChanged":
      return { ...state, category: action.value };
    case "difficultyChanged":
      return { ...state, difficulty: action.value };
    case "newTechInputChanged":
      return { ...state, newTechInput: action.value };
    case "technologyToggled": {
      const currentList = parseFieldList(state.technologies);
      const exists = currentList.some(
        (tItem) => tItem.toLowerCase() === action.technology.toLowerCase(),
      );
      const updated = exists
        ? currentList.filter(
            (tItem) => tItem.toLowerCase() !== action.technology.toLowerCase(),
          )
        : [...currentList, action.technology];
      return { ...state, technologies: formatFieldList(updated) };
    }
    case "customTechnologySubmitted": {
      const trimmed = state.newTechInput.trim();
      if (trimmed === "") return state;
      const currentList = parseFieldList(state.technologies);
      const technologies = currentList.some(
        (tItem) => tItem.toLowerCase() === trimmed.toLowerCase(),
      )
        ? state.technologies
        : formatFieldList([...currentList, trimmed]);
      return { ...state, technologies, newTechInput: "" };
    }
    case "previewStarted":
      return { ...state, reference: action.reference, submitError: null };
    case "previewSucceeded":
      return {
        ...state,
        preview: action.result,
        title: action.result.ownerDefaults.title,
        description: action.result.ownerDefaults.description ?? "",
        tags: formatFieldList(action.result.ownerDefaults.tags),
        technologies: formatFieldList(action.result.ownerDefaults.technologies),
        category: null,
        difficulty: "intermediate",
        draftIdempotencyKey: action.draftIdempotencyKey,
        createdDraft: null,
        uploadedHeroImage: null,
        currentStep: 2,
      };
    case "heroImageSelected":
      return {
        ...state,
        submitError: null,
        heroImage: action.file,
        uploadedHeroImage: null,
        heroImagePreview: action.previewUrl,
      };
    case "heroImageRejected":
      return { ...state, submitError: action.errorMessage };
    case "materialsAdded":
      return {
        ...state,
        queuedMaterials: [...state.queuedMaterials, ...action.materials],
      };
    case "materialRemoved":
      return {
        ...state,
        queuedMaterials: state.queuedMaterials.filter(
          (item) => item.id !== action.id,
        ),
      };
    case "materialUpdated":
      return {
        ...state,
        queuedMaterials: state.queuedMaterials.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item,
        ),
      };
    case "saveStarted":
      return { ...state, isSubmitting: true, submitError: null };
    case "draftCreated":
      return { ...state, createdDraft: action.project };
    case "heroImageUploaded":
      return {
        ...state,
        createdDraft: action.project,
        uploadedHeroImage: action.file,
      };
    case "publishSucceeded":
      return { ...state, publishedProject: action.project };
    case "saveFailed":
      return {
        ...state,
        ...(action.previewStale ? { preview: null, currentStep: 1 } : {}),
        submitError: action.errorMessage,
      };
    case "saveFinished":
      return { ...state, isSubmitting: false };
    case "stepChanged":
      return { ...state, currentStep: action.step };
    case "linkCopied":
      return { ...state, copiedLink: true };
    case "linkCopyReset":
      return { ...state, copiedLink: false };
  }
}

/** Whether the step-navigator pill for `step` may be clicked in `state`. */
export function canGoToStep(
  state: ImportProjectStepperState,
  step: number,
): boolean {
  const isComplete = state.currentStep > step;
  return isComplete || state.preview !== null || step <= state.currentStep;
}

/** Whether the step-navigator pill for `step` renders as disabled. */
export function isStepButtonDisabled(
  state: ImportProjectStepperState,
  step: number,
): boolean {
  const isComplete = state.currentStep > step;
  return (
    state.isSubmitting || (!isComplete && state.preview === null && step > 1)
  );
}

/** Whether `step` passes its own continuation rules (step 2 needs a title). */
export function validateStep(
  state: ImportProjectStepperState,
  step: number = state.currentStep,
): boolean {
  switch (step) {
    case 1:
      return state.preview !== null;
    case 2:
      return state.title.trim() !== "";
    default:
      return true;
  }
}

export function canGoNext(state: ImportProjectStepperState): boolean {
  return validateStep(state);
}

export function nextStep(state: ImportProjectStepperState): number {
  return Math.min(IMPORT_PROJECT_STEP_COUNT, state.currentStep + 1);
}

export function previousStep(state: ImportProjectStepperState): number {
  return Math.max(1, state.currentStep - 1);
}

/** Sidebar mini-checklist rule for the Identity step. */
export function isIdentityChecklistComplete(
  state: ImportProjectStepperState,
): boolean {
  return state.title.trim() !== "" && state.category !== null;
}

/** Sidebar mini-checklist rule for the Materials step. */
export function hasQueuedMaterials(state: ImportProjectStepperState): boolean {
  return state.queuedMaterials.length > 0;
}
