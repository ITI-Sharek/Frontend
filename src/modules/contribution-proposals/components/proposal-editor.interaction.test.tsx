// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ContributionProposalFields,
  ContributionProposalVersionDto,
} from "../types/contribution-proposal.types";
import { ProposalEditor } from "./proposal-editor";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("Proposal editor interactions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function submitForm() {
    const form = container.querySelector("form");
    if (!form) throw new Error("Editor form was not rendered.");
    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
  }

  it("submits only the four canonical fields when seeded from an existing version", async () => {
    // A revision response seeds the editor with the latest version, which also
    // carries `version`, `authoredBy` and `createdAt`. `version` is a number, so
    // any blanket string handling over the seed throws; and the backend
    // validation pipe runs `forbidNonWhitelisted`, so extra keys are a hard 400.
    const latest: ContributionProposalVersionDto = {
      version: 1,
      title: "عنوان المقترح الأول",
      problemOrOpportunity: "شرح المشكلة الحالية في المشروع بتفصيل كافٍ.",
      proposedOutcome: "وصف النتيجة المتوقعة من تنفيذ هذا المقترح بالكامل.",
      projectBenefit: "توضيح الفائدة التي تعود على المشروع من هذا العمل.",
      authoredBy: "contributor-id",
      createdAt: "2026-08-05T10:00:00.000Z",
    };
    const onSubmit = vi.fn<(fields: ContributionProposalFields) => Promise<void>>(
      () => Promise.resolve(),
    );

    await act(async () => {
      root.render(
        <ProposalEditor
          initialValue={latest}
          requiresDisclosure={false}
          isSubmitting={false}
          submitLabel="تأكيد وإرسال نسخة جديدة"
          error={null}
          onSubmit={onSubmit}
        />,
      );
    });

    await submitForm();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submitted = onSubmit.mock.calls[0][0];
    expect([...Object.keys(submitted)].sort()).toEqual([
      "problemOrOpportunity",
      "projectBenefit",
      "proposedOutcome",
      "title",
    ]);
    expect(submitted.title).toBe(latest.title);
  });

  it("trims surrounding whitespace before submitting", async () => {
    const onSubmit = vi.fn<(fields: ContributionProposalFields) => Promise<void>>(
      () => Promise.resolve(),
    );

    await act(async () => {
      root.render(
        <ProposalEditor
          initialValue={{
            title: "  عنوان المقترح المقدم  ",
            problemOrOpportunity: "  شرح المشكلة الحالية في المشروع بتفصيل.  ",
            proposedOutcome: "  وصف النتيجة المتوقعة من تنفيذ هذا المقترح.  ",
            projectBenefit: "  توضيح الفائدة التي تعود على المشروع كاملة.  ",
          }}
          requiresDisclosure={false}
          isSubmitting={false}
          submitLabel="إرسال"
          error={null}
          onSubmit={onSubmit}
        />,
      );
    });

    await submitForm();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].title).toBe("عنوان المقترح المقدم");
  });

  it("surfaces an error instead of failing silently when submission throws", async () => {
    const onSubmit = vi.fn<(fields: ContributionProposalFields) => Promise<void>>(
      () => Promise.reject(new Error("unexpected")),
    );

    await act(async () => {
      root.render(
        <ProposalEditor
          initialValue={{
            title: "عنوان المقترح المقدم",
            problemOrOpportunity: "شرح المشكلة الحالية في المشروع بتفصيل.",
            proposedOutcome: "وصف النتيجة المتوقعة من تنفيذ هذا المقترح.",
            projectBenefit: "توضيح الفائدة التي تعود على المشروع كاملة.",
          }}
          requiresDisclosure={false}
          isSubmitting={false}
          submitLabel="إرسال"
          error={null}
          onSubmit={onSubmit}
        />,
      );
    });

    await submitForm();

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent ?? "").not.toBe("");
  });

  it("uses the shared checkbox disclosure without changing submission behavior", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    await act(async () => {
      root.render(
        <ProposalEditor
          initialValue={{
            title: "عنوان المقترح المقدم",
            problemOrOpportunity: "شرح المشكلة الحالية في المشروع بتفصيل.",
            proposedOutcome: "وصف النتيجة المتوقعة من تنفيذ هذا المقترح.",
            projectBenefit: "توضيح الفائدة التي تعود على المشروع كاملة.",
          }}
          requiresDisclosure
          isSubmitting={false}
          submitLabel="إرسال"
          error={null}
          onSubmit={onSubmit}
        />,
      );
    });

    const disclosure = container.querySelector<HTMLButtonElement>(
      '[role="checkbox"]',
    );
    if (!disclosure) throw new Error("Expected disclosure checkbox");
    await act(async () => disclosure.click());
    await submitForm();

    expect(disclosure.getAttribute("aria-checked")).toBe("true");
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
