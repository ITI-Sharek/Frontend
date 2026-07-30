// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DeclineApplicationDialog } from "./decline-application-dialog";
import type { ApplicationDto } from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("decline Application confirmation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("requires human feedback and associates the error with the field", async () => {
    const onConfirm = vi.fn(async (_feedback: string) => undefined);
    await renderDialog(onConfirm);

    const submit = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تسجيل قرار عدم الاختيار"),
    );
    await act(async () => submit?.click());

    const textarea = container.querySelector("textarea");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(container.textContent).toContain("اكتب ملاحظات واضحة");
    expect(textarea?.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(textarea);
  });

  it("submits trimmed feedback and describes it as separate from AI", async () => {
    const onConfirm = vi.fn(async (_feedback: string) => undefined);
    await renderDialog(onConfirm);
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea");

    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(textarea, "  نحتاج خطة اختبار أوضح.  ");
      textarea?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const submit = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تسجيل قرار عدم الاختيار"),
    );
    await act(async () => submit?.click());

    expect(onConfirm).toHaveBeenCalledWith("نحتاج خطة اختبار أوضح.");
    expect(container.textContent).toContain("منفصلة عن أي نتائج تقييم استشاري");
  });

  async function renderDialog(
    onConfirm: (feedback: string) => Promise<void>,
  ) {
    await act(async () => {
      root.render(
        <DeclineApplicationDialog
          application={application()}
          isOpen
          isSubmitting={false}
          error={null}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
        />,
      );
    });
  }
});

function application(): ApplicationDto {
  return {
    id: "application-1",
    contributionRequestId: "request-1",
    contributor: { id: "user-1", username: "sara", displayName: "سارة" },
    profileContext: {
      bio: null,
      availability: null,
      experienceLevel: null,
      fields: [],
      declaredSkills: [],
    },
    contributionApproach: "A complete approach.",
    proposedDeliveryDurationDays: 5,
    status: "PENDING_OWNER_REVIEW",
    requirementSnapshot: { required: [], preferred: [] },
    evidenceSummary: [],
    submittedAt: "2026-07-28T10:00:00.000Z",
    reviewDueAt: null,
    expiresAt: null,
    expiredAt: null,
    overdue: false,
    ownerDecision: null,
    assignment: null,
  };
}
