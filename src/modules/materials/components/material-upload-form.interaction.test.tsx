// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MaterialUploadForm } from "./material-upload-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const CONSTRAINTS = {
  maxBytes: 1024,
  allowedMimeTypes: ["application/pdf", "text/plain"],
};

/**
 * React installs its own value setter on the input element, so assigning
 * `input.value` directly updates the DOM without React ever seeing it and the
 * controlled state stays empty. The prototype setter is the one React's
 * onChange listens behind.
 */
function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    globalThis.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function pickFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function makeFile(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("Material upload form", () => {
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
      onUpload: (input: unknown) => Promise<void>;
      allowAssignmentVisibility: boolean;
      constraints: typeof CONSTRAINTS | undefined;
      isConstraintsLoading: boolean;
      isSubmitting: boolean;
    }> = {},
  ) {
    await act(async () => {
      root.render(
        <MaterialUploadForm
          constraints={
            "constraints" in props ? props.constraints : CONSTRAINTS
          }
          isConstraintsLoading={props.isConstraintsLoading ?? false}
          allowAssignmentVisibility={props.allowAssignmentVisibility ?? false}
          isSubmitting={props.isSubmitting ?? false}
          onUpload={
            ((props.onUpload ?? (() => Promise.resolve())))
          }
        />,
      );
    });
  }

  const fileInput = () =>
    container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const titleInput = () =>
    [...container.querySelectorAll("input")].find(
      (input) => input.type !== "file" && input.type !== "radio",
    )!;
  // By type, not by label: the label changes to "جارٍ الرفع…" while submitting,
  // which is one of the states this suite needs to inspect.
  const submit = () =>
    container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const alertText = () =>
    container.querySelector('[role="alert"]')?.textContent ?? "";

  async function submitForm() {
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
  }

  it("states the server's formats and limit before a file is chosen", async () => {
    await render();

    // Read from the server, never duplicated in the client, so raising the
    // ceiling in config cannot leave the form advertising the old number.
    expect(container.textContent).toContain("PDF");
    expect(container.textContent).toContain("نص");
    expect(container.textContent).toContain("١ كيلوبايت".replace(/١/, "1"));
  });

  it("says it is still loading rather than showing no limit at all", async () => {
    await render({ constraints: undefined, isConstraintsLoading: true });

    expect(container.textContent).toContain("جارٍ تحميل الصيغ والحدود");
  });

  it("explains each visibility class instead of only naming it", async () => {
    await render();

    expect(container.textContent).toContain("عام داخل المشروع");
    expect(container.textContent).toContain("مقيّد بالمشروع");
    // "Restricted" means nothing on its own; the consequence is spelled out.
    expect(container.textContent).toContain("ينتهي الوصول فور سحب الصلاحية");
  });

  it("withholds assignment visibility on a Project", async () => {
    // A Project carries no Assignment, so the server refuses this class. It is
    // withheld rather than offered and then rejected.
    await render({ allowAssignmentVisibility: false });

    expect(container.textContent).not.toContain("خاص بالإسناد");
  });

  it("offers assignment visibility on a Contribution Request", async () => {
    await render({ allowAssignmentVisibility: true });

    expect(container.textContent).toContain("خاص بالإسناد");
  });

  it("refuses an oversized file before spending the upload", async () => {
    const onUpload = vi.fn();
    await render({ onUpload });

    pickFile(fileInput(), makeFile("big.pdf", "application/pdf", 2048));
    await act(async () => {});

    expect(alertText()).toContain("يتجاوز الحد المسموح");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("refuses an unsupported format locally", async () => {
    const onUpload = vi.fn();
    await render({ onUpload });

    pickFile(fileInput(), makeFile("sheet.xlsx", "application/vnd.ms-excel", 10));
    await act(async () => {});

    expect(alertText()).toContain("غير مدعومة");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("requires a file and a title", async () => {
    const onUpload = vi.fn();
    await render({ onUpload });

    await submitForm();
    expect(alertText()).toContain("اختر ملفًا");

    pickFile(fileInput(), makeFile("brief.pdf", "application/pdf", 10));
    await act(async () => {});
    await submitForm();
    expect(alertText()).toContain("عنوانًا");
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("uploads with a bare UUID idempotency key", async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    await render({ onUpload });

    pickFile(fileInput(), makeFile("brief.pdf", "application/pdf", 10));
    await act(async () => {});
    await act(async () => {
      typeInto(titleInput(), "كراسة الشروط");
    });
    await submitForm();

    expect(onUpload).toHaveBeenCalledTimes(1);
    const payload = onUpload.mock.calls[0][0];
    expect(payload.title).toBe("كراسة الشروط");
    expect(payload.visibility).toBe("PUBLIC");
    // Every Material command validates its key with @IsUUID('4'), so the
    // `cr-` prefix used elsewhere in the app would be rejected outright.
    expect(payload.idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("shows a server rejection in the form rather than swallowing it", async () => {
    const onUpload = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { data: { code: "MATERIAL_CONTENT_MISMATCH" } },
    });
    await render({ onUpload });

    pickFile(fileInput(), makeFile("brief.pdf", "application/pdf", 10));
    await act(async () => {});
    await act(async () => {
      typeInto(titleInput(), "كراسة الشروط");
    });
    await submitForm();

    expect(alertText()).toContain("لا يطابق صيغته المعلنة");
  });

  it("disables submission while an upload is in flight", async () => {
    await render({ isSubmitting: true });

    expect(submit().disabled).toBe(true);
    expect(submit().textContent).toContain("جارٍ الرفع");
  });

  it("labels every control, so the form is usable without sight", async () => {
    await render();

    const fileLabel = container.querySelector(
      `label[for="${fileInput().id}"]`,
    );
    expect(fileLabel?.textContent).toBe("الملف");
    expect(container.querySelector("legend")?.textContent).toBe("مستوى الظهور");
    expect(fileInput().getAttribute("aria-describedby")).toBeTruthy();
  });
});
