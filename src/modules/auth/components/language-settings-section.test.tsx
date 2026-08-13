// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSettingsSection } from "./language-settings-section";

vi.mock("../api/queries/use-current-user-query", () => ({
  useCurrentUserQuery: vi.fn(),
}));
vi.mock("../api/mutations/use-current-user-preferences-mutation", () => ({
  useUpdateCurrentUserPreferencesMutation: vi.fn(),
}));

const { useCurrentUserQuery } =
  await import("../api/queries/use-current-user-query");
const { useUpdateCurrentUserPreferencesMutation } =
  await import("../api/mutations/use-current-user-preferences-mutation");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const user = {
  id: "user-1",
  email: "user@example.com",
  username: null,
  firstName: "Sharek",
  lastName: "User",
  avatarUrl: null,
  role: "owner" as const,
  status: "active",
  preferredLanguage: "ar" as const,
  createdAt: "2026-08-09T00:00:00.000Z",
  updatedAt: "2026-08-09T00:00:00.000Z",
  lastLoginAt: null,
};

describe("LanguageSettingsSection", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mutate = vi.fn();
    vi.mocked(useCurrentUserQuery).mockReturnValue({ data: user } as never);
    vi.mocked(useUpdateCurrentUserPreferencesMutation).mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
    } as never);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it("persists a language choice through the identity mutation", async () => {
    await act(async () => root.render(<LanguageSettingsSection />));
    const english = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("English"),
    );
    if (!english) throw new Error("Expected English language button");

    await act(async () => english.click());

    expect(mutate).toHaveBeenCalledWith(
      { preferredLanguage: "en" },
      expect.any(Object),
    );
    expect(english.getAttribute("aria-pressed")).toBe("true");
  });

  it("restores the previous language when persistence fails", async () => {
    mutate.mockImplementationOnce((_input, options) => {
      options.onError(new Error("offline"));
    });
    await act(async () => root.render(<LanguageSettingsSection />));
    const english = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("English"),
    );
    if (!english) throw new Error("Expected English language button");

    await act(async () => english.click());

    expect(english.getAttribute("aria-pressed")).toBe("false");
    expect(container.textContent).toContain("تعذّر حفظ اللغة");
  });
});
