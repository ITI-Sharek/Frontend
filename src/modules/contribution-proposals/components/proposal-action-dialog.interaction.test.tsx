// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProposalActionDialog } from "./proposal-action-dialog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const FIELD = {
  label: "سبب الاعتذار",
  help: "سبب واقعي يخص المقترح.",
  minLength: 5,
  maxLength: 500,
};

describe("Proposal action dialog focus management", () => {
  let container: HTMLDivElement;
  let root: Root;
  let opener: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    // Stands in for the button that opened the dialog.
    opener = document.createElement("button");
    opener.textContent = "الاعتذار عن المقترح";
    document.body.append(opener);
    opener.focus();
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    container.remove();
    opener.remove();
  });

  async function open(props: Partial<{ isSubmitting: boolean }> = {}) {
    await act(async () => {
      root.render(
        <ProposalActionDialog
          isOpen
          title="الاعتذار عن المقترح"
          description="اشرح القرار للمساهم."
          confirmLabel="تأكيد الاعتذار"
          field={FIELD}
          isSubmitting={props.isSubmitting ?? false}
          error={null}
          destructive
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />,
      );
    });
  }

  it("returns focus to the trigger when the dialog closes", async () => {
    expect(document.activeElement).toBe(opener);

    await open();
    expect(document.activeElement).not.toBe(opener);
    expect(document.activeElement?.tagName).toBe("TEXTAREA");

    // The dialog closes by unmounting, not by isOpen flipping.
    await act(async () => root.unmount());

    expect(document.activeElement).toBe(opener);
  });

  it("does not steal focus back while a submission is in flight", async () => {
    await open();
    const field = document.activeElement as HTMLElement;

    // Move focus as a user might, then flip isSubmitting the way a submit does.
    const confirm = container.querySelector("button");
    confirm?.focus();
    expect(document.activeElement).not.toBe(field);

    await open({ isSubmitting: true });

    expect(document.activeElement).not.toBe(field);

    await act(async () => root.unmount());
  });
});
