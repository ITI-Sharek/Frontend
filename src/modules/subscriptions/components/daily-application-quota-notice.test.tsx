// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubscriptionPlanStatusDto } from "../types/subscription.types";
import { DailyApplicationQuotaNotice } from "./daily-application-quota-notice";

vi.mock("../api/queries/use-subscription-query", () => ({
  useSubscriptionStatusQuery: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
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
      used: 0,
      limit: 1,
      periodStart: "2026-08-14T00:00:00.000Z",
      periodEnd: "2026-08-15T00:00:00.000Z",
    },
    benefits: [],
    entitlements: [],
    ...overrides,
  };
}

function mockStatus(value: SubscriptionPlanStatusDto | undefined) {
  vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
    data: value,
    isPending: value === undefined,
    isError: false,
    refetch: vi.fn(),
  } as never);
}

describe("DailyApplicationQuotaNotice", () => {
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

  describe("within the limit", () => {
    it("states what a free contributor has left before they write anything", async () => {
      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toContain("يتبقّى لك طلب واحد من 1 اليوم");
      // Nothing about running out, and no upgrade nag while they still have one.
      expect(container.textContent).not.toContain("استهلكت");
      expect(container.querySelector("a")).toBeNull();
    });

    it("states what a Gold contributor has left", async () => {
      mockStatus(
        status({
          plan: "gold",
          usage: {
            used: 2,
            limit: 5,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toContain("من 5 اليوم");
      expect(container.querySelector("a")).toBeNull();
    });
  });

  describe("at the limit", () => {
    it("says the allowance is spent and when the server will refill it", async () => {
      mockStatus(
        status({
          usage: {
            used: 1,
            limit: 1,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toContain("استهلكت كل طلبات اليوم");
      // The server's periodEnd, formatted — never a phrase computed here.
      expect(container.textContent).toContain("15 أغسطس 2026");
      expect(container.textContent).not.toContain("خلال");
    });

    it("offers the upgrade without blocking or shaming", async () => {
      mockStatus(
        status({
          usage: {
            used: 1,
            limit: 1,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      const link = container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/plan");
      // Says what free still keeps, rather than scolding.
      expect(container.textContent).toContain("تحتفظ خطتك المجانية");
      // The notice never disables anything; the server decides, not this copy.
      expect(container.querySelectorAll("button")).toHaveLength(0);
    });

    it("does not push Gold at a contributor who already has it", async () => {
      mockStatus(
        status({
          plan: "gold",
          usage: {
            used: 5,
            limit: 5,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toContain("استهلكت كل طلبات اليوم");
      expect(container.querySelector("a")).toBeNull();
    });
  });

  describe("announcement", () => {
    it("announces the count politely when it changes", async () => {
      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      const live = container.querySelector("[role='status']");
      expect(live?.getAttribute("aria-live")).toBe("polite");

      mockStatus(
        status({
          usage: {
            used: 1,
            limit: 1,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );
      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      // Same live region, new content: assistive technology reads the change
      // rather than the region being replaced wholesale.
      expect(container.querySelector("[role='status']")?.textContent).toContain(
        "استهلكت كل طلبات اليوم",
      );
    });
  });

  describe("when there is nothing trustworthy to show", () => {
    it("renders nothing for an owner", async () => {
      mockStatus(status({ roleContext: "owner" }));

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toBe("");
    });

    it("renders nothing while the status is loading", async () => {
      mockStatus(undefined);

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toBe("");
    });

    it("renders nothing rather than a wrong count when usage is absent", async () => {
      mockStatus(status({ usage: null }));

      await act(async () => root.render(<DailyApplicationQuotaNotice />));

      expect(container.textContent).toBe("");
    });
  });
});
