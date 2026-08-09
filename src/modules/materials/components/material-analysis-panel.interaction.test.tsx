// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MaterialAnalysisPanel } from "./material-analysis-panel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  projectAdoption: {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
  },
  requestAdoption: {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
  },
  rejection: {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
  },
}));

vi.mock("../api/queries/use-material-queries", () => ({
  useProjectMaterialsQuery: () => ({
    data: [
      {
        id: "material-1",
        title: "Brief",
        versions: [
          {
            version: 1,
            scanStatus: "READY",
            purgedAt: null,
            originalFilename: "brief.md",
          },
        ],
      },
    ],
    isPending: false,
    isError: false,
  }),
  useMaterialAnalysisConstraintsQuery: () => ({
    data: {
      maxDocuments: 5,
      maxExtractedCharacters: 250_000,
      supportedMimeTypes: ["text/markdown"],
    },
    isPending: false,
    isError: false,
  }),
  useMaterialAnalysisRunQuery: () => ({
    data: {
      id: "run-1",
      analysisSetId: "set-1",
      contractVersion: "material-draft-v1",
      status: "COMPLETED",
      provider: "fixture",
      model: "fixture",
      promptVersion: "material-draft-v1",
      schemaVersion: "material-draft-v1",
      serviceVersion: "test",
      documentCount: 1,
      extractedCharacters: 12,
      errorCode: null,
      startedAt: null,
      completedAt: "2026-08-09T12:00:00.000Z",
      createdAt: "2026-08-09T12:00:00.000Z",
      suggestions: [
        {
          id: "project-suggestion",
          type: "PROJECT_UPDATE",
          targetField: "title",
          payload: { value: "Updated title" },
          rationale: "The brief names the project.",
          sourceVersions: [{ materialId: "material-1", version: 1 }],
          status: "PENDING",
          reviewedAt: null,
          sourceRemovedAt: null,
          adoptedEntityType: null,
          adoptedEntityId: null,
          createdAt: "2026-08-09T12:00:00.000Z",
        },
        {
          id: "request-suggestion",
          type: "CONTRIBUTION_REQUEST",
          targetField: null,
          payload: { title: "Add tests" },
          rationale: "The brief identifies missing tests.",
          sourceVersions: [{ materialId: "material-1", version: 1 }],
          status: "PENDING",
          reviewedAt: null,
          sourceRemovedAt: null,
          adoptedEntityType: null,
          adoptedEntityId: null,
          createdAt: "2026-08-09T12:00:00.000Z",
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
}));

vi.mock("../api/mutations/use-material-analysis-mutations", () => ({
  useCreateMaterialAnalysisSetMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useStartMaterialAnalysisRunMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useRejectMaterialDraftSuggestionMutation: () => mocks.rejection,
  useAdoptProjectMaterialSuggestionMutation: () => mocks.projectAdoption,
  useAdoptContributionRequestMaterialSuggestionMutation: () => mocks.requestAdoption,
}));

describe("Material analysis adoption actions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mocks.projectAdoption.isPending = false;
    mocks.requestAdoption.isPending = false;
    mocks.rejection.isPending = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  async function render(projectStatus: "draft" | "published") {
    await act(async () => {
      root.render(
        <MaterialAnalysisPanel
          projectId="project-1"
          projectRevision={4}
          projectStatus={projectStatus}
        />,
      );
    });
  }

  function button(text: string): HTMLButtonElement {
    const result = [...container.querySelectorAll("button")].find((item) =>
      item.textContent.includes(text),
    );
    if (!(result instanceof HTMLButtonElement)) throw new Error(`Missing button: ${text}`);
    return result;
  }

  it("invokes Project adoption with the current revision", async () => {
    await render("published");

    await act(async () => {
      button("اعتماد تحديث المشروع").click();
    });

    expect(mocks.projectAdoption.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestionId: "project-suggestion",
        expectedRevision: 4,
      }),
    );
  });

  it("keeps Contribution Request adoption disabled until the Project is published", async () => {
    await render("draft");

    expect(button("إنشاء طلب مساهمة كمسودة").disabled).toBe(true);
    expect(container.textContent).toContain("انشر المشروع أولاً لإنشاء طلب مساهمة");
  });

  it("invokes Contribution Request adoption after a close time is selected", async () => {
    await render("published");

    const closeTime = container.querySelector<HTMLInputElement>('input[type="datetime-local"]');
    expect(closeTime).not.toBeNull();
    if (!closeTime) throw new Error("Missing close time input");
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        globalThis.HTMLInputElement.prototype,
        "value",
      )?.set;
      if (!setter) throw new Error("Missing input value setter");
      setter.call(closeTime, "2099-08-09T15:00");
      closeTime.dispatchEvent(new Event("input", { bubbles: true }));
      closeTime.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await act(async () => {
      button("إنشاء طلب مساهمة كمسودة").click();
    });

    expect(mocks.requestAdoption.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestionId: "request-suggestion",
        applicationsCloseTime: new Date("2099-08-09T15:00").toISOString(),
      }),
    );
  });

  it("disables review actions while an adoption request is pending", async () => {
    mocks.projectAdoption.isPending = true;
    await render("published");

    expect(button("اعتماد تحديث المشروع").disabled).toBe(true);
    expect(button("إنشاء طلب مساهمة كمسودة").disabled).toBe(true);
  });
});
