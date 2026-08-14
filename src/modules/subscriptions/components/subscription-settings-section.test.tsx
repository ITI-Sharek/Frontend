// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionSettingsSection } from "./subscription-settings-section";

vi.mock("../api/queries/use-subscription-query", () => ({
  useSubscriptionStatusQuery: vi.fn(),
}));

const { useSubscriptionStatusQuery } = await import(
  "../api/queries/use-subscription-query"
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const freeOwnerStatus = {
  roleContext: "owner" as const,
  plan: "free" as const,
  status: "active" as const,
  source: "admin" as const,
  usage: {
    used: 8,
    limit: 20,
    periodStart: "2026-08-01T00:00:00.000Z",
    periodEnd: "2026-09-01T00:00:00.000Z",
  },
  benefits: [
    {
      key: "owner_contribution_request_limit",
      state: "included" as const,
      label: "Up to 20 Contribution Requests per calendar month",
    },
    {
      key: "ai_matching",
      state: "included" as const,
      label: "AI contributor matching",
    },
    {
      key: "commission",
      state: "unavailable" as const,
      label: "No platform commission",
    },
  ],
  entitlements: [
    { key: "PROJECT_MATERIAL_ANALYSIS" as const, state: "unavailable" as const },
  ],
};

describe("SubscriptionSettingsSection", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
      data: freeOwnerStatus,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  it("shows backend usage and benefit states without application quotas", async () => {
    await act(async () => root.render(<SubscriptionSettingsSection />));

    expect(container.textContent).toContain("Free");
    expect(container.textContent).toContain("8 من 20");
    expect(container.textContent).toContain("AI contributor matching");
    expect(container.textContent).toContain("No platform commission");
    expect(container.textContent).not.toContain("طلبات اليوم");
    expect(container.textContent).toContain("الترقية غير متاحة في معاينة MVP");
  });

  it("keeps the plan surface usable when the read model fails", async () => {
    vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    } as never);

    await act(async () => root.render(<SubscriptionSettingsSection />));

    expect(container.textContent).toContain("تعذّر تحميل حالة الاشتراك");
    expect(container.querySelector("button")?.textContent).toContain(
      "إعادة المحاولة",
    );
  });
});
