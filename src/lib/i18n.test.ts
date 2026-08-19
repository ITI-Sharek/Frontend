// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

describe("i18n server initialization", () => {
  it("does not use Node's navigator language for the initial SSR locale", async () => {
    vi.resetModules();

    const { default: serverI18n } = await import("./i18n");

    expect(serverI18n.language).toBe("ar");
  });
});
