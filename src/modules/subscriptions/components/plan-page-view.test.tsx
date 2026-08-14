// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubscriptionPlanStatusDto } from "../types/subscription.types";
import { PlanPageView } from "./plan-page-view";

vi.mock("../api/queries/use-subscription-query", () => ({
  useSubscriptionStatusQuery: vi.fn(),
}));

const { useSubscriptionStatusQuery } = await import(
  "../api/queries/use-subscription-query"
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function status(
  overrides: Partial<SubscriptionPlanStatusDto> = {},
): SubscriptionPlanStatusDto {
  return {
    roleContext: "contributor",
    plan: "free",
    status: "active",
    source: "default",
    usage: {
      used: 1,
      limit: 1,
      periodStart: "2026-08-14T00:00:00.000Z",
      periodEnd: "2026-08-15T00:00:00.000Z",
    },
    benefits: [
      {
        key: "CONTRIBUTOR_DAILY_APPLICATIONS",
        state: "included",
        label: "1 Application per day",
      },
      {
        key: "CONTRIBUTOR_MATCHED_PROJECTS",
        state: "unavailable",
        label: "Matched projects",
      },
    ],
    entitlements: [{ key: "PROJECT_MATERIAL_ANALYSIS", state: "unavailable" }],
    ...overrides,
  };
}

function mockStatus(value: SubscriptionPlanStatusDto) {
  vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
    data: value,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never);
}

describe("PlanPageView", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mockStatus(status());
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  it("states the Gold benefit and its price plainly to a free contributor", async () => {
    await act(async () => root.render(<PlanPageView />));

    expect(container.textContent).toContain("الذهبية");
    expect(container.textContent).toContain("٥٠٠ جنيه / شهريًا");
    expect(container.textContent).toContain("المشاريع المُطابقة");
  });

  it("renders the caller's own server-authored benefits, not invented ones", async () => {
    await act(async () => root.render(<PlanPageView />));

    expect(container.textContent).toContain("1 Application per day");
    expect(container.textContent).toContain("Matched projects");
    // Gold's numbers are the server's to state once the caller holds the plan;
    // this page never reconstructs them from the plan name.
    expect(container.textContent).not.toContain("5 Applications per day");
    expect(container.textContent).not.toContain("10 matched projects");
  });

  it("offers no purchase control while checkout does not exist", async () => {
    await act(async () => root.render(<PlanPageView />));

    // No dead button, and no affordance that implies a charge is possible.
    expect(container.querySelectorAll("button[disabled]")).toHaveLength(0);
    expect(container.textContent).toContain("لم يُفتح بعد");
    expect(container.querySelector("[role='note']")).not.toBeNull();
  });

  it("mentions no commission in either plan", async () => {
    await act(async () => root.render(<PlanPageView />));

    expect(container.textContent.toLowerCase()).not.toContain("commission");
    expect(container.textContent).not.toContain("عمولة");
  });

  it("drops the upgrade card entirely for a Gold contributor", async () => {
    mockStatus(
      status({
        plan: "gold",
        benefits: [
          {
            key: "CONTRIBUTOR_MATCHED_PROJECTS",
            state: "included",
            label: "10 matched projects",
          },
        ],
      }),
    );

    await act(async () => root.render(<PlanPageView />));

    expect(container.textContent).toContain("خطتك");
    expect(container.textContent).not.toContain("٥٠٠ جنيه");
    expect(container.textContent).not.toContain("لم يُفتح بعد");
  });

  it("renders the server's period end rather than a computed one", async () => {
    await act(async () => root.render(<PlanPageView />));

    expect(container.textContent).toContain("15 أغسطس 2026");
  });

  it("announces loading and error distinctly", async () => {
    vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    } as never);
    await act(async () => root.render(<PlanPageView />));
    expect(container.querySelector("[role='status']")).not.toBeNull();

    const refetch = vi.fn();
    vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    } as never);
    await act(async () => root.render(<PlanPageView />));
    expect(container.querySelector("[role='alert']")).not.toBeNull();

    await act(async () => container.querySelector("button")?.click());
    expect(refetch).toHaveBeenCalled();
  });
});
