// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MaterialDto, MaterialVersionDto } from "../types/material.types";
import { MaterialVersionRow } from "./material-version-row";

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
  originalFilename: "كراسة-الشروط.pdf",
  contentHash: "a".repeat(64),
  uploadedAt: "2026-08-07T09:00:00.000Z",
  scannedAt: "2026-08-07T09:01:00.000Z",
  purgedAt: null,
  ...overrides,
});

const material = (deletedAt: string | null = null) =>
  ({ deletedAt }) as MaterialDto;

describe("Material version row", () => {
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

  async function render(props: {
    material?: MaterialDto;
    version?: MaterialVersionDto;
    onDownload?: (version: number) => Promise<void>;
  }) {
    await act(async () => {
      root.render(
        <MaterialVersionRow
          material={props.material ?? material()}
          version={props.version ?? version()}
          isCurrent
          onDownload={(props.onDownload ?? (() => Promise.resolve()))}
        />,
      );
    });
  }

  const downloadButton = () =>
    [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تنزيل"),
    );

  it("offers an enabled download only for a READY version", async () => {
    await render({});

    const button = downloadButton();
    expect(button?.disabled).toBe(false);
    expect(button?.textContent).toContain("تنزيل");
  });

  it.each([
    ["QUARANTINED" as const, null],
    ["SCANNING" as const, null],
    ["REJECTED" as const, null],
    ["QUARANTINED" as const, "MATERIAL_SCAN_ABANDONED"],
  ])(
    "never renders an active download for a %s version (%s)",
    async (scanStatus, scanErrorCode) => {
      await render({ version: version({ scanStatus, scanErrorCode }) });

      const button = downloadButton();
      expect(button?.disabled).toBe(true);
      expect(button?.getAttribute("aria-disabled")).toBe("true");
      // Disabled with a stated reason, not silently greyed out: a control
      // nobody can explain is worse than one that is absent.
      expect(button?.getAttribute("title")).toBeTruthy();
    },
  );

  it("never renders an active download for a deleted Material", async () => {
    // Its newest version still reads READY from the server, so this is exactly
    // the case where keying on scanStatus alone would offer a purged file.
    await render({ material: material("2026-08-07T10:00:00.000Z") });

    expect(downloadButton()?.disabled).toBe(true);
  });

  it("states an abandoned scan without calling the file malware", async () => {
    await render({
      version: version({
        scanStatus: "QUARANTINED",
        scanErrorCode: "MATERIAL_SCAN_ABANDONED",
      }),
    });

    expect(container.textContent).toContain("تعذّر الفحص");
    expect(container.textContent).toContain("هذا لا يعني أن الملف ضار");
    expect(container.textContent).not.toContain("محتوى ضارًا");
  });

  it("says the state in words, not only as a coloured chip", async () => {
    await render({ version: version({ scanStatus: "QUARANTINED" }) });

    // Colour is never the only signal: the label and the full explanation are
    // both present as text.
    expect(container.textContent).toContain("في الحجر");
    expect(container.textContent).toContain("بانتظار الفحص الأمني");
  });

  it("is reachable and operable from the keyboard", async () => {
    const onDownload = vi.fn().mockResolvedValue(undefined);
    await render({ onDownload });

    const button = downloadButton();
    button?.focus();
    expect(document.activeElement).toBe(button);

    // A real <button> activates on Enter and Space; clicking it is what the
    // browser does in response, so this asserts the handler is wired to the
    // element rather than to a mouse-only listener.
    await act(async () => {
      button?.click();
    });
    expect(onDownload).toHaveBeenCalledWith(1);
  });

  it("surfaces a failed download instead of leaving a spinner", async () => {
    const onDownload = vi.fn().mockRejectedValue(new Error("تعذّر الاتصال"));
    await render({ onDownload });

    await act(async () => {
      downloadButton()?.click();
    });

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("تعذّر الاتصال");
    expect(downloadButton()?.disabled).toBe(false);
  });

  it("shows the filename, format, and size for each version", async () => {
    await render({});

    expect(container.textContent).toContain("كراسة-الشروط.pdf");
    expect(container.textContent).toContain("PDF");
    expect(container.textContent).toContain("كيلوبايت");
  });
});
