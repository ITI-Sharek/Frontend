// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationPreferencesPanel } from "./notification-preferences-panel";

vi.mock("../api/queries/use-notification-queries", () => ({
  useNotificationPreferencesQuery: vi.fn(),
}));
vi.mock("../api/mutations/use-notification-mutations", () => ({
  useUpdateNotificationPreferencesMutation: vi.fn(),
}));

const { useNotificationPreferencesQuery } = await import(
  "../api/queries/use-notification-queries"
);
const { useUpdateNotificationPreferencesMutation } = await import(
  "../api/mutations/use-notification-mutations"
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const preferences = {
  retentionDays: 90 as const,
  quietHours: {
    enabled: false,
    startLocal: null,
    endLocal: null,
    timeZone: null,
  },
  revision: 4,
  categories: [
    {
      type: "application_status" as const,
      requiredInApp: true,
      inAppEnabled: true,
      browserEnabled: false,
    },
    {
      type: "skill_review" as const,
      requiredInApp: false,
      inAppEnabled: true,
      browserEnabled: false,
    },
  ],
};

describe("NotificationPreferencesPanel", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mutate = vi.fn();
    vi.mocked(useNotificationPreferencesQuery).mockReturnValue({
      data: preferences,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateNotificationPreferencesMutation).mockReturnValue({
      mutate,
      isPending: false,
    } as never);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  async function render() {
    await act(async () => root.render(<NotificationPreferencesPanel />));
  }

  it("shows defaults, required locks, optional categories, and deferred browser delivery", async () => {
    await render();

    expect(
      container.querySelector<HTMLSelectElement>(
        "select[name=notification-retention]",
      )?.value,
    ).toBe("90");
    const required = container.querySelector<HTMLInputElement>(
      "input[name=notification-category-application_status]",
    );
    expect(required?.checked).toBe(true);
    expect(required?.disabled).toBe(true);
    expect(
      container.querySelector<HTMLInputElement>(
        "input[name=notification-category-skill_review]",
      )?.disabled,
    ).toBe(false);
    expect(container.textContent).toContain("متاحة في شريحة لاحقة");
    expect(container.textContent).toContain("لا يمكن تعطيل التنبيهات الأساسية");
  });

  it("saves approved retention, overnight quiet hours, timezone, and optional categories", async () => {
    await render();

    await act(async () => {
      const retention = container.querySelector<HTMLSelectElement>(
        "select[name=notification-retention]",
      );
      if (!retention) throw new Error("Expected retention select");
      retention.value = "180";
      retention.dispatchEvent(new Event("change", { bubbles: true }));

      const quiet = container.querySelector<HTMLInputElement>(
        "input[name=notification-quiet-hours-enabled]",
      );
      if (!quiet) throw new Error("Expected quiet-hours toggle");
      quiet.click();

      const start = container.querySelector<HTMLInputElement>(
        "input[name=notification-quiet-hours-start]",
      );
      const end = container.querySelector<HTMLInputElement>(
        "input[name=notification-quiet-hours-end]",
      );
      if (!start || !end) throw new Error("Expected quiet-hours fields");
      start.value = "22:00";
      start.dispatchEvent(new Event("input", { bubbles: true }));
      end.value = "06:00";
      end.dispatchEvent(new Event("input", { bubbles: true }));

      const optional = container.querySelector<HTMLInputElement>(
        "input[name=notification-category-skill_review]",
      );
      if (!optional) throw new Error("Expected optional category");
      optional.click();
    });

    const save = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("حفظ تفضيلات الإشعارات"),
    );
    if (!save) throw new Error("Expected save button");
    await act(async () => save.click());

    expect(mutate).toHaveBeenCalledWith(
      {
        expectedRevision: 4,
        retentionDays: 180,
        quietHours: expect.objectContaining({
          enabled: true,
          startLocal: "22:00",
          endLocal: "06:00",
        }),
        categories: [
          {
            type: "application_status",
            inAppEnabled: true,
            browserEnabled: false,
          },
          {
            type: "skill_review",
            inAppEnabled: false,
            browserEnabled: false,
          },
        ],
      },
      expect.any(Object),
    );
  });

  it("restores the server form and announces a revision conflict", async () => {
    const conflict = new AxiosError("conflict");
    conflict.response = {
      data: { code: "NOTIFICATION_PREFERENCES_REVISION_CONFLICT" },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    };
    mutate.mockImplementationOnce((_patch, options) => {
      options.onError(conflict);
    });
    await render();

    const retention = container.querySelector<HTMLSelectElement>(
      "select[name=notification-retention]",
    );
    if (!retention) throw new Error("Expected retention select");
    await act(async () => {
      retention.value = "365";
      retention.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const save = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("حفظ تفضيلات الإشعارات"),
    );
    if (!save) throw new Error("Expected save button");
    await act(async () => save.click());

    expect(
      container.querySelector<HTMLSelectElement>(
        "select[name=notification-retention]",
      )?.value,
    ).toBe("90");
    expect(container.textContent).toContain("تغيّرت التفضيلات في جلسة أخرى");
  });
});
