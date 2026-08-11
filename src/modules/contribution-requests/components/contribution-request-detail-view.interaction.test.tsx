// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContributionRequestDetailView } from "./contribution-request-detail-view";
import type { ContributionRequestDto } from "../types/contribution-request.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  update: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  discard: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  publish: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  cancel: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}));

vi.mock("../api/queries/use-contribution-request-query", () => ({
  useContributionRequestQuery: mocks.query,
}));

vi.mock("../api/mutations/use-contribution-request-mutations", () => ({
  useUpdateContributionRequestMutation: () => mocks.update,
  useDiscardContributionRequestMutation: () => mocks.discard,
  usePublishContributionRequestMutation: () => mocks.publish,
  useCancelContributionRequestMutation: () => mocks.cancel,
}));

vi.mock("./owner-application-review", () => ({
  OwnerApplicationReview: () => null,
}));

describe("Contribution Request owner lifecycle interactions", () => {
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

  it("preserves recoverable draft input after a concurrent update conflict", async () => {
    let request = makeRequest();
    const refetch = vi.fn(async () => {
      request = {
        ...request,
        title: "Server-side title",
        updatedAt: "2026-07-30T12:05:00.000Z",
      };
      return { data: request };
    });
    mocks.query.mockImplementation(() => ({
      isPending: false,
      isError: false,
      data: request,
      refetch,
    }));
    mocks.update.mutateAsync.mockRejectedValueOnce(
      axiosContractError("CONTRIBUTION_REQUEST_CONCURRENT_MODIFICATION"),
    );

    await act(async () => {
      root.render(
        <ContributionRequestDetailView
          requestId="request-1"
          projectHref={(projectId) => `/my-projects/${projectId}`}
        />,
      );
    });

    const titleInput = container.querySelector<HTMLInputElement>(
      "#contribution-request-title",
    );
    expect(titleInput).not.toBeNull();

    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(titleInput, "My recoverable title");
      titleInput!.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      container
        .querySelector<HTMLFormElement>("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(refetch).not.toHaveBeenCalled();
    expect(
      container.querySelector<HTMLInputElement>("#contribution-request-title")
        ?.value,
    ).toBe("My recoverable title");
  });

  it("keeps keyboard focus meaningful through a successful publish transition", async () => {
    let request = makeRequest();
    mocks.query.mockImplementation(() => ({
      isPending: false,
      isError: false,
      data: request,
      refetch: vi.fn(),
    }));
    mocks.publish.mutateAsync.mockImplementationOnce(async () => {
      request = {
        ...request,
        status: "published",
        publishedAt: "2026-07-30T12:10:00.000Z",
        updatedAt: "2026-07-30T12:10:00.000Z",
      };
      return request;
    });

    await act(async () => {
      root.render(
        <ContributionRequestDetailView
          requestId="request-1"
          projectHref={(projectId) => `/my-projects/${projectId}`}
        />,
      );
    });

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>("#publish-request-trigger")
        ?.click();
    });

    const confirm = document.querySelector<HTMLButtonElement>(
      "#publish-request-confirm",
    );
    expect(document.activeElement).toBe(confirm);

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    });
    expect(document.activeElement?.textContent).toContain("إلغاء");

    await act(async () => {
      confirm?.focus();
      confirm?.click();
    });

    const lifecycleFocusTarget = container.querySelector<HTMLElement>(
      "#contribution-request-lifecycle-focus",
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(lifecycleFocusTarget?.textContent).toContain(
      "منشور ومرئي للمساهمين",
    );
    expect(document.activeElement).toBe(lifecycleFocusTarget);
  });

  it("explains that a published request no longer accepts applications after close time", async () => {
    const request = makeRequest({
      status: "published",
      applicationsCloseTime: "2020-08-05T12:00:00.000Z",
    });
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: request,
      refetch: vi.fn(),
    });

    await act(async () => {
      root.render(
        <ContributionRequestDetailView
          requestId="request-1"
          projectHref={(projectId) => `/my-projects/${projectId}`}
        />,
      );
    });

    expect(container.textContent).toContain("التقديم مغلق");
    expect(container.textContent).toContain("لا يستقبل طلبات تقديم جديدة");
  });

  it("closes a destructive dialog with Escape, restores focus, and resets its draft", async () => {
    const request = makeRequest();
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: request,
      refetch: vi.fn(),
    });

    await act(async () => {
      root.render(
        <ContributionRequestDetailView
          requestId="request-1"
          projectHref={(projectId) => `/my-projects/${projectId}`}
        />,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>(
      "#discard-request-trigger",
    );
    await act(async () => trigger?.click());

    const reason = document.querySelector<HTMLTextAreaElement>("#discard-reason");
    expect(document.activeElement?.id).toBe("discard-request-cancel");
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(reason, "Changed scope");
      reason?.dispatchEvent(new Event("input", { bubbles: true }));
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => trigger?.click());
    expect(
      document.querySelector<HTMLTextAreaElement>("#discard-reason")?.value,
    ).toBe("");
  });

  it("composes the delivery workspace behind its own owner tab", async () => {
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: makeRequest({ status: "assigned" }),
      refetch: vi.fn(),
    });

    await act(async () => {
      root.render(
        <ContributionRequestDetailView
          requestId="request-1"
          projectHref={(projectId) => `/my-projects/${projectId}`}
          deliverySlot={<section>مساحة مراجعة التسليم</section>}
        />,
      );
    });

    expect(container.textContent).not.toContain("مساحة مراجعة التسليم");
    const deliveryTab = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === "التسليم",
    );
    await act(async () => deliveryTab?.click());
    expect(container.textContent).toContain("مساحة مراجعة التسليم");
  });
});

function makeRequest(
  overrides: Partial<ContributionRequestDto> = {},
): ContributionRequestDto {
  return {
    id: "request-1",
    projectId: "project-1",
    title: "Original title",
    description: "A complete Contribution Request description.",
    requiredRequirements: [
      {
        id: "requirement-1",
        kind: "required",
        position: 0,
        text: "Deliver tested behavior",
      },
    ],
    preferredRequirements: [],
    technologyTags: ["React"],
    applicationsCloseTime: "2030-08-10T12:00:00.000Z",
  attribution: null,
    targetCompletionDate: "2030-08-20",
    difficulty: "intermediate",
    reward: null,
    rewardCurrency: null,
    status: "draft",
    publishedAt: null,
    createdAt: "2026-07-30T12:00:00.000Z",
    updatedAt: "2026-07-30T12:00:00.000Z",
    ...overrides,
  };
}

function axiosContractError(code: string) {
  return {
    isAxiosError: true,
    response: {
      status: 409,
      data: { code, message: "Contract error" },
    },
  };
}
