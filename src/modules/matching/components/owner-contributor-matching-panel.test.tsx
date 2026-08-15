// @vitest-environment happy-dom

import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OwnerContributorMatchingPanel } from "./owner-contributor-matching-panel";
import type { OwnerContributorMatchingResponseDto } from "../types/matching.types";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  subscription: vi.fn(),
  matching: {
    data: undefined as OwnerContributorMatchingResponseDto | undefined,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
  },
}));

vi.mock("@/modules/subscriptions", () => ({
  useSubscriptionStatusQuery: mocks.subscription,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../api/mutations/use-owner-contributor-matching-mutation", () => ({
  useOwnerContributorMatchingMutation: () => mocks.matching,
}));

describe("OwnerContributorMatchingPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
    mocks.matching.data = undefined;
    mocks.matching.isPending = false;
    mocks.matching.isError = false;
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("shows an honest locked state to a free owner", async () => {
    mocks.subscription.mockReturnValue({
      isPending: false,
      isError: false,
      data: { roleContext: "owner", plan: "free" },
    });

    await act(async () => {
      root.render(<OwnerContributorMatchingPanel requestId="request-1" />);
    });

    expect(container.textContent).toContain("مطابقة المساهمين ميزة للمالك");
    expect(container.querySelector('a[href="/plan"]')).not.toBeNull();
  });

  it("lets a Gold owner explicitly generate matches", async () => {
    mocks.subscription.mockReturnValue({
      isPending: false,
      isError: false,
      data: { roleContext: "owner", plan: "gold" },
    });

    await act(async () => {
      root.render(<OwnerContributorMatchingPanel requestId="request-1" />);
    });
    const button = [...container.querySelectorAll("button")].find((item) =>
      item.textContent.includes("إنشاء مطابقات المساهمين"),
    );
    expect(button).toBeDefined();
    if (!button) throw new Error("Generate matches button was not rendered");

    await act(async () => button.click());
    expect(mocks.matching.mutate).toHaveBeenCalledWith("request-1");
  });
});
