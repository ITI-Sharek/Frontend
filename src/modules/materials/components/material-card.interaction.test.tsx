// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MaterialDto, MaterialVersionDto } from "../types/material.types";
import { MaterialCard } from "./material-card";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

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

describe("Material card", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    container.remove();
  });

  async function render(
    props: Partial<{
      material: MaterialDto;
      isOwner: boolean;
      isGrantsOpen: boolean;
      onDelete: (input: unknown) => Promise<void>;
      onAddVersion: (input: unknown) => Promise<void>;
      onOpenGrants: (materialId: string) => void;
    }> = {},
  ) {
    await act(async () => {
      root.render(
        <MaterialCard
          material={props.material ?? material()}
          isOwner={props.isOwner ?? true}
          grants={[]}
          isGrantsLoading={false}
          isGrantSubmitting={false}
          isGrantsOpen={props.isGrantsOpen ?? false}
          onOpenGrants={props.onOpenGrants ?? (() => {})}
          onDownload={() => Promise.resolve()}
          onAddVersion={
            ((props.onAddVersion ?? (() => Promise.resolve())))
          }
          onDelete={((props.onDelete ?? (() => Promise.resolve())))}
          onGrant={() => Promise.resolve()}
          onRevoke={() => Promise.resolve()}
        />,
      );
    });
  }

  const button = (text: string) =>
    [...container.querySelectorAll("button")].find((candidate) =>
      candidate.textContent.includes(text),
    );

  it("explains the visibility class, not just its name", async () => {
    await render({ material: material({ visibility: "RESTRICTED_PROJECT" }) });

    expect(container.textContent).toContain("مقيّد بالمشروع");
    expect(container.textContent).toContain("إسناد");
  });

  it("shows every version, newest labelled as current", async () => {
    // Replacement is an append: the previous version is still listed, because
    // collaborators may already have read it.
    await render({
      material: material({
        currentVersion: 2,
        versions: [
          version({ version: 2, scanStatus: "QUARANTINED" }),
          version({ version: 1 }),
        ],
      }),
    });

    expect(container.textContent).toContain("النسخة 2");
    expect(container.textContent).toContain("النسخة 1");
    expect(container.textContent).toContain("(الأحدث)");
  });

  it("offers grant management only for a restricted Material", async () => {
    await render({ material: material({ visibility: "PUBLIC" }) });
    expect(button("إدارة الصلاحيات")).toBeUndefined();

    await render({ material: material({ visibility: "RESTRICTED_PROJECT" }) });
    expect(button("إدارة الصلاحيات")).toBeDefined();
  });

  it("hides every owner control from a reader", async () => {
    await render({ isOwner: false });

    expect(button("رفع نسخة جديدة")).toBeUndefined();
    expect(button("حذف المادة")).toBeUndefined();
  });

  it("withdraws owner controls once the Material is deleted", async () => {
    // Its content is gone, so "upload a new version" would be an action the
    // server can only refuse.
    await render({
      material: material({ deletedAt: "2026-08-07T10:00:00.000Z" }),
    });

    expect(button("رفع نسخة جديدة")).toBeUndefined();
    expect(button("حذف المادة")).toBeUndefined();
    expect(container.textContent).toContain("قيد الحذف");
  });

  it("confirms before deleting, and says what deletion does", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    await render({ onDelete });

    await act(async () => {
      button("حذف المادة")?.click();
    });
    expect(container.textContent).toContain("سيُلغى وصول الجميع فورًا");
    expect(onDelete).not.toHaveBeenCalled();

    await act(async () => {
      button("تأكيد الحذف")?.click();
    });
    expect(onDelete).toHaveBeenCalledWith({
      materialId: material().id,
      idempotencyKey: expect.any(String),
    });
  });

  it("lets the owner back out of a delete", async () => {
    const onDelete = vi.fn();
    await render({ onDelete });

    await act(async () => {
      button("حذف المادة")?.click();
    });
    await act(async () => {
      button("تراجع")?.click();
    });

    expect(onDelete).not.toHaveBeenCalled();
    expect(button("حذف المادة")).toBeDefined();
  });

  it("reports a refused deletion rather than appearing to succeed", async () => {
    const onDelete = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { data: { code: "MATERIAL_ALREADY_DELETED" } },
    });
    await render({ onDelete });

    await act(async () => {
      button("حذف المادة")?.click();
    });
    await act(async () => {
      button("تأكيد الحذف")?.click();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "سبق حذف",
    );
  });

  it("uploads a replacement version through a labelled control", async () => {
    const onAddVersion = vi.fn().mockResolvedValue(undefined);
    await render({ onAddVersion });

    const fileInput = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!;
    // Visually hidden, not display:none — a hidden input is unreachable, and
    // the visible button is what opens it.
    expect(fileInput.className).toContain("sr-only");
    expect(fileInput.getAttribute("aria-label")).toBe("اختيار نسخة جديدة");

    const file = new File(["x"], "v2.pdf", { type: "application/pdf" });
    Object.defineProperty(fileInput, "files", {
      value: { 0: file, length: 1, item: () => file },
      configurable: true,
    });
    await act(async () => {
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onAddVersion).toHaveBeenCalledWith({
      materialId: material().id,
      file,
      idempotencyKey: expect.any(String),
    });
  });

  it("offers nothing that starts AI processing", async () => {
    // Upload is storage consent. The separation is only credible if this
    // surface never offers the next step.
    await render({ material: material({ visibility: "RESTRICTED_PROJECT" }) });

    const text = container.textContent;
    for (const forbidden of ["تحليل", "الذكاء الاصطناعي", "اقتراح"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
