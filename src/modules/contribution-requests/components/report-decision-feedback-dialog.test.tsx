// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReportDecisionFeedbackDialog } from "./report-decision-feedback-dialog";
import type {
  DecisionFeedbackReportReason,
  OwnerDecisionDto,
} from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("decision feedback moderation report", () => {
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

  it("explains reporting without promising an appeal", async () => {
    await renderDialog(async () => undefined);
    expect(container.textContent).toContain("بلاغ للمراجعة الإشرافية");
    expect(container.textContent).toContain("ليس استئنافًا");
    expect(container.textContent).toContain("لن يعيد فتح طلب التقديم");
    expect(
      [...container.querySelectorAll("option")].map((option) => option.value),
    ).toEqual([
      "harassment",
      "misuse",
      "fraud",
      "reputation_manipulation",
      "inaccurate_ai",
      "other",
    ]);
    expect(document.activeElement).toBe(container.querySelector("select"));
  });

  it("validates a factual minimum description before submission", async () => {
    const onConfirm = vi.fn(
      async (
        _reason: DecisionFeedbackReportReason,
        _description: string,
      ) => undefined,
    );
    await renderDialog(onConfirm);
    const submit = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("إرسال البلاغ"),
    );

    await act(async () => submit?.click());
    expect(onConfirm).not.toHaveBeenCalled();
    expect(container.textContent).toContain("10 أحرف على الأقل");
    expect(document.activeElement).toBe(container.querySelector("textarea"));
  });

  it("submits the selected moderation reason and trimmed description", async () => {
    const onConfirm = vi.fn(
      async (
        _reason: DecisionFeedbackReportReason,
        _description: string,
      ) => undefined,
    );
    await renderDialog(onConfirm);
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea");

    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(
        textarea,
        "  تحتوي الملاحظات على لغة مسيئة وغير مرتبطة بالعمل.  ",
      );
      textarea?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const submit = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("إرسال البلاغ"),
    );
    await act(async () => submit?.click());

    expect(onConfirm).toHaveBeenCalledWith(
      "harassment",
      "تحتوي الملاحظات على لغة مسيئة وغير مرتبطة بالعمل.",
    );
  });

  async function renderDialog(
    onConfirm: (
      reason: DecisionFeedbackReportReason,
      description: string,
    ) => Promise<void>,
  ) {
    await act(async () => {
      root.render(
        <ReportDecisionFeedbackDialog
          decision={decision}
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

const decision: OwnerDecisionDto = {
  id: "decision-1",
  applicationId: "application-1",
  contributionRequestId: "request-1",
  decisionType: "DECLINED",
  feedback: "ملاحظات غير مناسبة",
  decidedAt: "2026-07-30T12:00:00.000Z",
};
