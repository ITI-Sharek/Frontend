import { describe, expect, it } from "vitest";

import type { QueuedMaterial } from "../schemas/import-project-stepper.schema";
import type {
  PreviewGitHubRepositoryResponseDto,
  ProjectOwnerViewDto,
} from "../types/project-draft.types";
import type {
  ImportProjectStepperState,
} from "./import-project-stepper.machine";
import {
  canGoNext,
  canGoToStep,
  hasQueuedMaterials,
  importProjectStepperReducer,
  initialImportProjectStepperState,
  isIdentityChecklistComplete,
  isStepButtonDisabled,
  nextStep,
  previousStep,
  validateStep,
} from "./import-project-stepper.machine";

function makePreview(
  overrides: Partial<
    PreviewGitHubRepositoryResponseDto["ownerDefaults"]
  > = {},
): PreviewGitHubRepositoryResponseDto {
  return {
    previewFingerprint: "fp-1",
    source: { fullName: "owner/repo" },
    imported: {},
    evidence: {},
    ownerDefaults: {
      title: "Detected Title",
      description: "Detected description",
      tags: ["react", "vite"],
      technologies: ["TypeScript", "Tailwind"],
      ...overrides,
    },
  } as unknown as PreviewGitHubRepositoryResponseDto;
}

function makeProject(
  overrides: Partial<ProjectOwnerViewDto> = {},
): ProjectOwnerViewDto {
  return {
    id: "project-1",
    slug: "project-slug",
    revision: 3,
    ...overrides,
  } as unknown as ProjectOwnerViewDto;
}

function makeMaterial(id: string): QueuedMaterial {
  return {
    id,
    file: new File(["content"], `${id}.md`, { type: "text/markdown" }),
    title: id,
    visibility: "PUBLIC",
  };
}

function stateWith(
  overrides: Partial<ImportProjectStepperState>,
): ImportProjectStepperState {
  return { ...initialImportProjectStepperState, ...overrides };
}

describe("importProjectStepperReducer", () => {
  describe("previewStarted", () => {
    it("stores the trimmed reference and clears the submit error", () => {
      const next = importProjectStepperReducer(
        stateWith({ submitError: "boom" }),
        { type: "previewStarted", reference: "owner/repo" },
      );
      expect(next.reference).toBe("owner/repo");
      expect(next.submitError).toBeNull();
    });
  });

  describe("previewSucceeded", () => {
    it("imports owner defaults, resets wizard fields, and advances to step 2", () => {
      const file = new File(["x"], "hero.png", { type: "image/png" });
      const previous = stateWith({
        title: "Old",
        description: "Old description",
        tags: "stale",
        technologies: "stale",
        category: "web",
        difficulty: "advanced",
        draftIdempotencyKey: "old-key",
        createdDraft: makeProject(),
        uploadedHeroImage: file,
        currentStep: 1,
      });

      const next = importProjectStepperReducer(previous, {
        type: "previewSucceeded",
        result: makePreview({ description: null }),
        draftIdempotencyKey: "new-key",
      });

      expect(next.preview?.previewFingerprint).toBe("fp-1");
      expect(next.title).toBe("Detected Title");
      expect(next.description).toBe("");
      expect(next.tags).toBe("react, vite");
      expect(next.technologies).toBe("TypeScript, Tailwind");
      expect(next.category).toBeNull();
      expect(next.difficulty).toBe("intermediate");
      expect(next.draftIdempotencyKey).toBe("new-key");
      expect(next.createdDraft).toBeNull();
      expect(next.uploadedHeroImage).toBeNull();
      expect(next.currentStep).toBe(2);
    });
  });

  describe("technologyToggled", () => {
    it("appends a technology that is not selected", () => {
      const next = importProjectStepperReducer(
        stateWith({ technologies: "React" }),
        { type: "technologyToggled", technology: "Go" },
      );
      expect(next.technologies).toBe("React, Go");
    });

    it("removes a selected technology case-insensitively", () => {
      const next = importProjectStepperReducer(
        stateWith({ technologies: "React, Go" }),
        { type: "technologyToggled", technology: "react" },
      );
      expect(next.technologies).toBe("Go");
    });
  });

  describe("customTechnologySubmitted", () => {
    it("keeps state untouched when the input is blank", () => {
      const previous = stateWith({ newTechInput: "   " });
      expect(
        importProjectStepperReducer(previous, {
          type: "customTechnologySubmitted",
        }),
      ).toBe(previous);
    });

    it("adds a trimmed custom technology and clears the input", () => {
      const next = importProjectStepperReducer(
        stateWith({ technologies: "React", newTechInput: " GraphQL " }),
        { type: "customTechnologySubmitted" },
      );
      expect(next.technologies).toBe("React, GraphQL");
      expect(next.newTechInput).toBe("");
    });

    it("only clears the input when the technology already exists", () => {
      const next = importProjectStepperReducer(
        stateWith({ technologies: "React", newTechInput: "react" }),
        { type: "customTechnologySubmitted" },
      );
      expect(next.technologies).toBe("React");
      expect(next.newTechInput).toBe("");
    });
  });

  describe("hero image", () => {
    it("heroImageSelected swaps the file, preview URL, and clears the upload marker", () => {
      const file = new File(["x"], "hero.png", { type: "image/png" });
      const next = importProjectStepperReducer(
        stateWith({ submitError: "bad image", uploadedHeroImage: file }),
        { type: "heroImageSelected", file, previewUrl: "blob:preview" },
      );
      expect(next.submitError).toBeNull();
      expect(next.heroImage).toBe(file);
      expect(next.uploadedHeroImage).toBeNull();
      expect(next.heroImagePreview).toBe("blob:preview");
    });

    it("heroImageRejected only records the error message", () => {
      const file = new File(["x"], "hero.png", { type: "image/png" });
      const next = importProjectStepperReducer(
        stateWith({ heroImage: file }),
        { type: "heroImageRejected", errorMessage: "Invalid image" },
      );
      expect(next.submitError).toBe("Invalid image");
      expect(next.heroImage).toBe(file);
    });
  });

  describe("queued materials", () => {
    it("materialsAdded appends without mutating the previous queue", () => {
      const first = makeMaterial("one");
      const second = makeMaterial("two");
      const withOne = importProjectStepperReducer(initialImportProjectStepperState, {
        type: "materialsAdded",
        materials: [first],
      });
      const withTwo = importProjectStepperReducer(withOne, {
        type: "materialsAdded",
        materials: [second],
      });
      expect(withTwo.queuedMaterials).toEqual([first, second]);
      expect(withOne.queuedMaterials).toEqual([first]);
    });

    it("materialRemoved filters by id", () => {
      const next = importProjectStepperReducer(
        stateWith({
          queuedMaterials: [makeMaterial("one"), makeMaterial("two")],
        }),
        { type: "materialRemoved", id: "one" },
      );
      expect(next.queuedMaterials.map((m) => m.id)).toEqual(["two"]);
    });

    it("materialUpdated merges partial updates", () => {
      const next = importProjectStepperReducer(
        stateWith({ queuedMaterials: [makeMaterial("one")] }),
        {
          type: "materialUpdated",
          id: "one",
          updates: { title: "Renamed", visibility: "RESTRICTED_PROJECT" },
        },
      );
      expect(next.queuedMaterials[0]?.title).toBe("Renamed");
      expect(next.queuedMaterials[0]?.visibility).toBe("RESTRICTED_PROJECT");
    });
  });

  describe("save lifecycle", () => {
    it("saveStarted marks submitting and clears the error", () => {
      const next = importProjectStepperReducer(
        stateWith({ submitError: "previous failure" }),
        { type: "saveStarted" },
      );
      expect(next.isSubmitting).toBe(true);
      expect(next.submitError).toBeNull();
    });

    it("draftCreated and heroImageUploaded track the latest draft", () => {
      const file = new File(["x"], "hero.png", { type: "image/png" });
      const draft = makeProject({ id: "p1", revision: 1 });
      const uploaded = makeProject({ id: "p1", revision: 2 });

      const withDraft = importProjectStepperReducer(initialImportProjectStepperState, {
        type: "draftCreated",
        project: draft,
      });
      expect(withDraft.createdDraft).toBe(draft);

      const withUpload = importProjectStepperReducer(withDraft, {
        type: "heroImageUploaded",
        project: uploaded,
        file,
      });
      expect(withUpload.createdDraft).toBe(uploaded);
      expect(withUpload.uploadedHeroImage).toBe(file);
    });

    it("publishSucceeded records the published project", () => {
      const next = importProjectStepperReducer(initialImportProjectStepperState, {
        type: "publishSucceeded",
        project: { id: "p1", slug: "p1-slug" },
      });
      expect(next.publishedProject).toEqual({ id: "p1", slug: "p1-slug" });
    });

    it("saveFailed keeps the preview when the error is not stale", () => {
      const preview = makePreview();
      const next = importProjectStepperReducer(
        stateWith({ preview, currentStep: 4 }),
        { type: "saveFailed", errorMessage: "Network down", previewStale: false },
      );
      expect(next.preview).toBe(preview);
      expect(next.currentStep).toBe(4);
      expect(next.submitError).toBe("Network down");
    });

    it("saveFailed on a stale preview clears it and returns to step 1", () => {
      const next = importProjectStepperReducer(
        stateWith({ preview: makePreview(), currentStep: 4 }),
        { type: "saveFailed", errorMessage: "Stale", previewStale: true },
      );
      expect(next.preview).toBeNull();
      expect(next.currentStep).toBe(1);
      expect(next.submitError).toBe("Stale");
    });

    it("saveFinished stops submitting", () => {
      const next = importProjectStepperReducer(
        stateWith({ isSubmitting: true }),
        { type: "saveFinished" },
      );
      expect(next.isSubmitting).toBe(false);
    });
  });

  it("stepChanged, linkCopied, and linkCopyReset update their fields", () => {
    const atStep3 = importProjectStepperReducer(initialImportProjectStepperState, {
      type: "stepChanged",
      step: 3,
    });
    expect(atStep3.currentStep).toBe(3);

    const copied = importProjectStepperReducer(atStep3, { type: "linkCopied" });
    expect(copied.copiedLink).toBe(true);

    const reset = importProjectStepperReducer(copied, { type: "linkCopyReset" });
    expect(reset.copiedLink).toBe(false);
  });
});

describe("step transition helpers", () => {
  describe("nextStep / previousStep", () => {
    it("advances and clamps at the boundaries", () => {
      expect(nextStep(stateWith({ currentStep: 1 }))).toBe(2);
      expect(nextStep(stateWith({ currentStep: 4 }))).toBe(4);
      expect(previousStep(stateWith({ currentStep: 2 }))).toBe(1);
      expect(previousStep(stateWith({ currentStep: 1 }))).toBe(1);
    });
  });

  describe("canGoToStep", () => {
    it("only allows the current step before a preview exists", () => {
      const state = stateWith({ currentStep: 1 });
      expect(canGoToStep(state, 1)).toBe(true);
      expect(canGoToStep(state, 2)).toBe(false);
      expect(canGoToStep(state, 4)).toBe(false);
    });

    it("allows any later step once a preview exists", () => {
      const state = stateWith({ currentStep: 1, preview: makePreview() });
      expect(canGoToStep(state, 2)).toBe(true);
      expect(canGoToStep(state, 4)).toBe(true);
    });

    it("allows completed and current steps mid-wizard", () => {
      const state = stateWith({ currentStep: 3 });
      expect(canGoToStep(state, 2)).toBe(true);
      expect(canGoToStep(state, 3)).toBe(true);
      expect(canGoToStep(state, 4)).toBe(false);
    });
  });

  describe("isStepButtonDisabled", () => {
    it("disables future steps before a preview exists", () => {
      const state = stateWith({ currentStep: 1 });
      expect(isStepButtonDisabled(state, 1)).toBe(false);
      expect(isStepButtonDisabled(state, 2)).toBe(true);
    });

    it("enables future steps once a preview exists", () => {
      const state = stateWith({ currentStep: 1, preview: makePreview() });
      expect(isStepButtonDisabled(state, 2)).toBe(false);
      expect(isStepButtonDisabled(state, 4)).toBe(false);
    });

    it("disables every pill while submitting", () => {
      const state = stateWith({
        currentStep: 3,
        preview: makePreview(),
        isSubmitting: true,
      });
      expect(isStepButtonDisabled(state, 1)).toBe(true);
      expect(isStepButtonDisabled(state, 2)).toBe(true);
      expect(isStepButtonDisabled(state, 3)).toBe(true);
    });
  });

  describe("validateStep / canGoNext", () => {
    it("step 1 requires a preview", () => {
      expect(validateStep(stateWith({ currentStep: 1 }), 1)).toBe(false);
      expect(
        validateStep(stateWith({ currentStep: 1, preview: makePreview() }), 1),
      ).toBe(true);
    });

    it("step 2 requires a non-blank title", () => {
      expect(validateStep(stateWith({ currentStep: 2, title: "" }), 2)).toBe(false);
      expect(validateStep(stateWith({ currentStep: 2, title: "   " }), 2)).toBe(false);
      expect(validateStep(stateWith({ currentStep: 2, title: "Sharek" }), 2)).toBe(true);
    });

    it("steps 3 and 4 always validate", () => {
      expect(validateStep(stateWith({ currentStep: 3 }), 3)).toBe(true);
      expect(validateStep(stateWith({ currentStep: 4 }), 4)).toBe(true);
    });

    it("canGoNext validates the current step", () => {
      expect(canGoNext(stateWith({ currentStep: 2, title: "" }))).toBe(false);
      expect(canGoNext(stateWith({ currentStep: 3 }))).toBe(true);
    });
  });

  describe("sidebar checklist helpers", () => {
    it("identity needs both a title and a category", () => {
      expect(isIdentityChecklistComplete(stateWith({ title: "T" }))).toBe(false);
      expect(isIdentityChecklistComplete(stateWith({ category: "web" }))).toBe(false);
      expect(
        isIdentityChecklistComplete(stateWith({ title: "T", category: "web" })),
      ).toBe(true);
    });

    it("materials completion tracks the queue", () => {
      expect(hasQueuedMaterials(stateWith({}))).toBe(false);
      expect(
        hasQueuedMaterials(stateWith({ queuedMaterials: [makeMaterial("m")] })),
      ).toBe(true);
    });
  });
});
