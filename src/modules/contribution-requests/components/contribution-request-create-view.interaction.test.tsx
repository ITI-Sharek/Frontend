// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContributionRequestCreateView } from "./contribution-request-create-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  create: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}));

vi.mock("../api/mutations/use-contribution-request-mutations", () => ({
  useCreateContributionRequestMutation: () => mocks.create,
}));

describe("Contribution Request creation interactions", () => {
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

  it("preserves draft input when the backend rejects the Project state", async () => {
    mocks.create.mutateAsync.mockRejectedValueOnce(
      axiosContractError("CONTRIBUTION_REQUEST_PROJECT_NOT_PUBLISHED"),
    );

    await act(async () => {
      root.render(
        <ContributionRequestCreateView
          projectId="project-1"
          projectTitle="Sharek"
          cancelHref="/my-projects/project-1"
          onCreated={vi.fn()}
        />,
      );
    });

    await setInput("#contribution-request-title", "Recoverable draft title");
    await setTextArea(
      "#contribution-request-description",
      "A complete recoverable description.",
    );
    await setInput(
      '[aria-label="المتطلبات المطلوبة 1"]',
      "Deliver tested behavior",
    );
    await setInput("#applications-close-time", "2030-08-10T12:00");

    await act(async () => {
      container
        .querySelector<HTMLFormElement>("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain("انشر المشروع");
    expect(
      container.querySelector<HTMLInputElement>("#contribution-request-title")
        ?.value,
    ).toBe("Recoverable draft title");
  });

  async function setInput(selector: string, value: string) {
    const input = container.querySelector<HTMLInputElement>(selector);
    expect(input).not.toBeNull();
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(input, value);
      input?.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  async function setTextArea(selector: string, value: string) {
    const input = container.querySelector<HTMLTextAreaElement>(selector);
    expect(input).not.toBeNull();
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(input, value);
      input?.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
});

function axiosContractError(code: string) {
  return {
    isAxiosError: true,
    response: {
      status: 409,
      data: { code, message: "Contract error" },
    },
  };
}
