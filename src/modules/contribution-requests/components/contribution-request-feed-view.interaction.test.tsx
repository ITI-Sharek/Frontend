// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContributionRequestFeedView } from "./contribution-request-feed-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("../api/queries/use-contribution-requests-query", () => ({
  useContributionRequestsQuery: mocks.query,
}));

describe("Contribution Request feed filters", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      isPlaceholderData: false,
      data: { items: [], totalCount: 0, technologyFacets: [] },
      refetch: vi.fn(),
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it("lets contributors request the supported no-reward subset", async () => {
    const onFiltersChange = vi.fn();
    await act(async () => {
      root.render(
        <ContributionRequestFeedView
          filters={{}}
          onFiltersChange={onFiltersChange}
          onReset={vi.fn()}
          requestHref={(requestId) => `/tasks/${requestId}`}
        />,
      );
    });

    const rewardFilter = container.querySelector<HTMLSelectElement>(
      'select[aria-label="المكافأة"]',
    );
    expect(rewardFilter).not.toBeNull();

    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set?.call(rewardFilter, "without-reward");
      rewardFilter?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onFiltersChange).toHaveBeenCalledWith({ hasReward: false });
  });

  it("keeps the long filter controls collapsed by default on mobile", async () => {
    await act(async () => {
      root.render(
        <ContributionRequestFeedView
          filters={{ technologies: ["React"], difficulty: "intermediate" }}
          onFiltersChange={vi.fn()}
          onReset={vi.fn()}
          requestHref={(requestId) => `/tasks/${requestId}`}
        />,
      );
    });

    const mobileFilters = container.querySelector<HTMLDetailsElement>("details");
    const summary = mobileFilters?.querySelector("summary");

    expect(mobileFilters?.open).toBe(false);
    expect(summary?.textContent).toContain("تصفية النتائج");
    expect(summary?.textContent).toContain("2");

    await act(async () => summary?.click());

    expect(mobileFilters?.open).toBe(true);
  });
});
