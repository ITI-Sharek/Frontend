// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";

describe("i18n browser initialization", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("still restores an explicitly persisted English preference", async () => {
    localStorage.setItem("sharek-lang", "en");
    vi.resetModules();

    const { default: browserI18n } = await import("./i18n");

    expect(browserI18n.language).toBe("en");
    expect(browserI18n.t("auth.loginHero")).toBe("Welcome back");
  });
});
