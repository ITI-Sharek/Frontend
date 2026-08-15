// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DevLoginButtons } from "./dev-login-buttons";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
}));

vi.mock("../services/auth.service", () => ({ loginUser: mocks.login }));
vi.mock("@/services/storage.service", () => ({
  storageService: {
    setAccessToken: mocks.setAccessToken,
    setRefreshToken: mocks.setRefreshToken,
  },
}));

describe("DevLoginButtons", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
    mocks.login.mockResolvedValue({
      user: {
        id: "owner-1",
        email: "gold-owner@sharek.local",
        username: null,
        firstName: "Gold",
        lastName: "Owner",
        avatarUrl: null,
        role: "owner",
        status: "active",
        preferredLanguage: "en",
        createdAt: "2026-08-15T00:00:00.000Z",
        updatedAt: "2026-08-15T00:00:00.000Z",
        lastLoginAt: null,
      },
      tokens: {
        accessToken: "access",
        refreshToken: "refresh",
        expiresAt: "2026-08-15T01:00:00.000Z",
        refreshExpiresAt: "2026-08-22T00:00:00.000Z",
      },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("renders Gold owner and Gold contributor shortcuts", async () => {
    await act(async () => root.render(<DevLoginButtons />));

    expect(container.textContent).toContain("مساهم ذهبي");
    expect(container.textContent).toContain("مالك ذهبي");
  });

  it("signs in with the seeded Gold owner credentials", async () => {
    const onLoginSuccess = vi.fn();
    await act(async () =>
      root.render(<DevLoginButtons onLoginSuccess={onLoginSuccess} />),
    );
    const button = [...container.querySelectorAll("button")].find((candidate) =>
      candidate.textContent.includes("مالك ذهبي"),
    );
    if (!button) throw new Error("Gold owner button was not rendered");

    await act(async () => button.click());

    expect(mocks.login).toHaveBeenCalledWith({
      email: "gold-owner@sharek.local",
      password: "Admin@1234",
    });
    expect(mocks.setAccessToken).toHaveBeenCalledWith("access");
    expect(mocks.setRefreshToken).toHaveBeenCalledWith("refresh");
    expect(onLoginSuccess).toHaveBeenCalledOnce();
  });
});
