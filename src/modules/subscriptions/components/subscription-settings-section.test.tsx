// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SubscriptionPlanStatusDto } from "../types/subscription.types";
import { SubscriptionSettingsSection } from "./subscription-settings-section";

vi.mock("../api/queries/use-subscription-query", () => ({
  useSubscriptionStatusQuery: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => <a href={to}>{children}</a>,
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
    entitlements: [
      { key: "PROJECT_MATERIAL_ANALYSIS", state: "unavailable" },
    ],
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

describe("SubscriptionSettingsSection", () => {
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

  describe("the four payloads", () => {
    it("renders a free contributor's daily allowance and locked benefit", async () => {
      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("المجانية");
      expect(container.textContent).toContain("الطلبات المُرسلة اليوم");
      expect(container.textContent).toContain("0 من 1");
      // Localized benefits in active locale (Arabic).
      expect(container.textContent).toContain("طلب تقديم واحد يوميًا");
      expect(container.textContent).toContain("المشاريع المُطابقة");
    });

    it("renders a Gold contributor without an upgrade prompt", async () => {
      mockStatus(
        status({
          plan: "gold",
          source: "payment_provider",
          usage: {
            used: 3,
            limit: 5,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
          benefits: [
            {
              key: "CONTRIBUTOR_DAILY_APPLICATIONS",
              state: "included",
              label: "5 Applications per day",
            },
            {
              key: "CONTRIBUTOR_MATCHED_PROJECTS",
              state: "included",
              label: "10 matched projects",
            },
          ],
        }),
      );

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("الذهبية");
      expect(container.textContent).toContain("3 من 5");
      expect(container.textContent).toContain("10 مشاريع مُطابقة");
      // Nothing to upgrade to.
      expect(container.textContent).not.toContain("عرض الخطط");
    });

    it("renders a free owner's monthly publication allowance", async () => {
      mockStatus(
        status({
          roleContext: "owner",
          usage: {
            used: 2,
            limit: 5,
            periodStart: "2026-08-01T00:00:00.000Z",
            periodEnd: "2026-09-01T00:00:00.000Z",
          },
          benefits: [
            {
              key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
              state: "included",
              label: "5 published Contribution Requests per month",
            },
          ],
        }),
      );

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("طلبات المساهمة المنشورة هذا الشهر");
      expect(container.textContent).toContain("2 من 5");
      expect(container.textContent).toContain("5 طلبات مساهمة منشورة شهريًا");
      expect(container.textContent).not.toContain("الطلبات المُرسلة اليوم");
    });

    it("renders a Gold owner", async () => {
      mockStatus(
        status({
          roleContext: "owner",
          plan: "gold",
          usage: {
            used: 11,
            limit: 30,
            periodStart: "2026-08-01T00:00:00.000Z",
            periodEnd: "2026-09-01T00:00:00.000Z",
          },
          benefits: [
            {
              key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
              state: "included",
              label: "30 published Contribution Requests per month",
            },
          ],
        }),
      );

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("11 من 30");
      expect(container.textContent).toContain("30 طلب مساهمة منشورًا شهريًا");
      expect(container.textContent).toContain("الذهبية");
    });
  });

  describe("what this phase must not say", () => {
    it("shows no commission benefit, because the server emits none", async () => {
      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent.toLowerCase()).not.toContain("commission");
      expect(container.textContent).not.toContain("عمولة");
    });

    it("leaves no dead purchase control behind", async () => {
      await act(async () => root.render(<SubscriptionSettingsSection />));

      const disabled = container.querySelectorAll("button[disabled]");
      expect(disabled).toHaveLength(0);
      expect(container.textContent).not.toContain("معاينة MVP");
    });

    it("offers a working link to the plan page instead", async () => {
      await act(async () => root.render(<SubscriptionSettingsSection />));

      const link = container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/plan");
      expect(link?.textContent).toContain("عرض الخطط");
    });
  });

  describe("timing copy", () => {
    it("renders the server's periodEnd rather than a computed reset", async () => {
      await act(async () => root.render(<SubscriptionSettingsSection />));

      // 15 August 2026 is the instant the server sent, formatted for the
      // reader. Nothing here derives a time from the machine clock (DEC-034),
      // so no relative phrase appears.
      expect(container.textContent).toContain("15 أغسطس 2026");
      expect(container.textContent).not.toContain("خلال");
    });

    it("renders no renewal sentence when the server sent no period", async () => {
      mockStatus(status({ usage: null }));

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("لا يوجد استخدام محسوب");
      expect(container.textContent).not.toContain("يتجدّد");
    });
  });

  describe("plan status", () => {
    it("says a cancelled plan keeps its benefits until the period ends", async () => {
      mockStatus(status({ plan: "gold", status: "cancelled" }));

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("ملغاة");
      expect(container.textContent).toContain("تبقى مزاياك فعّالة");
    });
  });

  describe("distinct states", () => {
    it("announces loading", async () => {
      vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        refetch: vi.fn(),
      } as never);

      await act(async () => root.render(<SubscriptionSettingsSection />));

      const live = container.querySelector("[role='status']");
      expect(live?.getAttribute("aria-live")).toBe("polite");
      expect(container.textContent).toContain("جارٍ تحميل حالة الاشتراك");
    });

    it("announces an error and offers a retry", async () => {
      const refetch = vi.fn();
      vi.mocked(useSubscriptionStatusQuery).mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        refetch,
      } as never);

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.querySelector("[role='alert']")).not.toBeNull();
      const retry = container.querySelector("button");
      expect(retry?.textContent).toContain("إعادة المحاولة");

      await act(async () => retry?.click());
      expect(refetch).toHaveBeenCalled();
    });

    it("distinguishes an empty benefit list from a failure", async () => {
      mockStatus(status({ benefits: [] }));

      await act(async () => root.render(<SubscriptionSettingsSection />));

      expect(container.textContent).toContain("لا توجد مزايا مدرجة");
      expect(container.querySelector("[role='alert']")).toBeNull();
    });
  });

  describe("the usage meter", () => {
    it("exposes the remaining count to assistive technology", async () => {
      mockStatus(
        status({
          usage: {
            used: 3,
            limit: 5,
            periodStart: "2026-08-14T00:00:00.000Z",
            periodEnd: "2026-08-15T00:00:00.000Z",
          },
        }),
      );

      await act(async () => root.render(<SubscriptionSettingsSection />));

      const meter = container.querySelector("[role='progressbar']");
      expect(meter?.getAttribute("aria-valuenow")).toBe("3");
      expect(meter?.getAttribute("aria-valuemax")).toBe("5");
      // Arabic has a dual form, so 2 remaining is "اثنان" rather than a digit.
      expect(meter?.getAttribute("aria-valuetext")).toBe("يتبقّى اثنان");
    });
  });
});
