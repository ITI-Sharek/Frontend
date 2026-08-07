// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MaterialDto, MaterialVersionDto } from "../types/material.types";
import { MaterialsPanel } from "./materials-panel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../services/materials.service", () => ({
  getMaterialUploadConstraints: vi.fn().mockResolvedValue({
    maxBytes: 26_214_400,
    allowedMimeTypes: ["application/pdf"],
  }),
  getMaterialGrants: vi.fn().mockResolvedValue([]),
  getProjectMaterials: vi.fn().mockResolvedValue([]),
  getContributionRequestMaterials: vi.fn().mockResolvedValue([]),
  uploadProjectMaterial: vi.fn(),
  uploadContributionRequestMaterial: vi.fn(),
  addMaterialVersion: vi.fn(),
  grantMaterialAccess: vi.fn(),
  revokeMaterialAccess: vi.fn(),
  changeMaterialVisibility: vi.fn(),
  deleteMaterial: vi.fn(),
  downloadMaterialVersion: vi.fn(),
}));

const version = (
  overrides: Partial<MaterialVersionDto> = {},
): MaterialVersionDto => ({
  version: 1,
  scanStatus: "READY",
  scanErrorCode: null,
  byteSize: 2048,
  mimeType: "application/pdf",
  originalFilename: "brief.pdf",
  contentHash: "a".repeat(64),
  uploadedAt: "2026-08-07T09:00:00.000Z",
  scannedAt: "2026-08-07T09:01:00.000Z",
  purgedAt: null,
  ...overrides,
});

const material = (overrides: Partial<MaterialDto> = {}): MaterialDto => ({
  id: "55555555-5555-4555-8555-555555555555",
  projectId: "33333333-3333-4333-8333-333333333333",
  contributionRequestId: null,
  ownerId: "77777777-7777-4777-8777-777777777777",
  title: "كراسة الشروط",
  visibility: "PUBLIC",
  currentVersion: 1,
  versions: [version()],
  deletedAt: null,
  createdAt: "2026-08-07T09:00:00.000Z",
  updatedAt: "2026-08-07T09:00:00.000Z",
  ...overrides,
});

describe("Materials panel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.documentElement.setAttribute("dir", "rtl");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    container.remove();
  });

  async function render(
    props: Partial<{
      isOwner: boolean;
      materials: MaterialDto[] | undefined;
      isLoading: boolean;
      isError: boolean;
    }> = {},
  ) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MaterialsPanel
            scope={{ kind: "project", id: "33333333-3333-4333-8333-333333333333" }}
            isOwner={props.isOwner ?? true}
            materials={"materials" in props ? props.materials : [material()]}
            isLoading={props.isLoading ?? false}
            isError={props.isError ?? false}
          />
        </QueryClientProvider>,
      );
    });
  }

  it("says upload is not consent to AI processing", async () => {
    await render();

    expect(container.textContent).toContain(
      "رفع الملف هنا لا يعني الموافقة على معالجته بالذكاء الاصطناعي",
    );
  });

  it("offers no control that starts analysis", async () => {
    await render();

    const actionLabels = [...container.querySelectorAll("button")]
      .map((button) => button.textContent)
      .join(" ");
    for (const forbidden of ["تحليل", "اقتراح", "الذكاء"]) {
      expect(actionLabels).not.toContain(forbidden);
    }
  });

  it("shows the upload form to an owner and withholds it from a reader", async () => {
    await render({ isOwner: true });
    expect(container.textContent).toContain("رفع مادة جديدة");

    await render({ isOwner: false });
    expect(container.textContent).not.toContain("رفع مادة جديدة");
  });

  it("distinguishes an owner's empty list from a reader's", async () => {
    await render({ isOwner: true, materials: [] });
    expect(container.textContent).toContain("لم ترفع أي مادة بعد");

    await render({ isOwner: false, materials: [] });
    expect(container.textContent).toContain("لا توجد مواد متاحة لك");
  });

  it("reports a failed load instead of showing an empty list", async () => {
    // An empty list and a failed request look identical to a user, and only
    // one of them means "there is nothing here".
    await render({ isError: true, materials: undefined });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "تعذّر تحميل المواد",
    );
  });

  it("uses logical properties so the layout follows the RTL document", async () => {
    await render();

    // `ms-`/`me-` rather than `ml-`/`mr-`: a hardcoded left margin puts the
    // spacing on the wrong side in Arabic.
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bclass="[^"]*\bml-\d/);
    expect(html).not.toMatch(/\bclass="[^"]*\bmr-\d/);
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("lays out for narrow screens before widening", async () => {
    await render();

    // Mobile-first: the base is a column and `sm:` widens it, so a small
    // viewport is the default rather than an override.
    const html = container.innerHTML;
    expect(html).toContain("flex-col");
    expect(html).toMatch(/sm:(flex-row|w-auto|p-5|items-start)/);
  });

  it("renders the heading as a labelled landmark", async () => {
    await render();

    const section = container.querySelector("section[aria-labelledby]");
    const headingId = section?.getAttribute("aria-labelledby");
    expect(container.querySelector(`#${headingId}`)?.textContent).toBe(
      "المواد والمستندات",
    );
  });
});
