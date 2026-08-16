import { describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/config/routes.config";
import type { AuthUserDto } from "@/modules/auth";

import { requireOwnerRoute, requireRouteAccess } from "./route-access";

function makeUser(role: AuthUserDto["role"]): AuthUserDto {
  return {
    id: `${role}-1`,
    email: `${role}@example.com`,
    username: role === "contributor" ? "sara" : null,
    firstName: "Sara",
    lastName: "Ahmed",
    avatarUrl: null,
    role,
    status: "active",
    preferredLanguage: "ar",
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    lastLoginAt: null,
  };
}

function makeDependencies(user: AuthUserDto, token: string | null = "token") {
  return {
    isBrowser: true,
    getAccessToken: () => token,
    clearSession: vi.fn(),
    getUser: vi.fn().mockResolvedValue(user),
  };
}

describe("route access", () => {
  it("defers browser-only session checks during server rendering", async () => {
    const dependencies = makeDependencies(makeUser("contributor"));

    await expect(
      requireRouteAccess(
        { allowedRoles: ["contributor"] },
        { ...dependencies, isBrowser: false },
      ),
    ).resolves.toEqual({});
    expect(dependencies.getUser).not.toHaveBeenCalled();
  });

  it("redirects a browser session without an access token to login", async () => {
    const dependencies = makeDependencies(makeUser("contributor"), null);

    await expect(
      requireRouteAccess({ allowedRoles: ["contributor"] }, dependencies),
    ).rejects.toMatchObject({ options: { to: ROUTES.login } });
    expect(dependencies.getUser).not.toHaveBeenCalled();
  });

  it("returns the authenticated user when their role is allowed", async () => {
    const user = makeUser("owner");

    await expect(
      requireRouteAccess(
        { allowedRoles: ["owner", "contributor"] },
        makeDependencies(user),
      ),
    ).resolves.toEqual({ currentUser: user });
  });

  it("reuses the parent layout user for nested role checks", async () => {
    const user = makeUser("owner");

    await expect(
      requireOwnerRoute({ context: { currentUser: user } }),
    ).resolves.toEqual({ currentUser: user });
  });

  it("redirects role mismatches to the user's own workspace", async () => {
    await expect(
      requireRouteAccess(
        { allowedRoles: ["owner"] },
        makeDependencies(makeUser("contributor")),
      ),
    ).rejects.toMatchObject({
      options: { to: ROUTES.dashboard },
    });
  });

  it("can conceal an admin route from a non-admin user", async () => {
    await expect(
      requireRouteAccess(
        { allowedRoles: ["admin"], onRoleMismatch: "not-found" },
        makeDependencies(makeUser("owner")),
      ),
    ).rejects.toMatchObject({ isNotFound: true });
  });

  it("clears an invalid session and redirects to login", async () => {
    const dependencies = makeDependencies(makeUser("owner"));
    dependencies.getUser.mockRejectedValue({ response: { status: 401 } });

    await expect(
      requireRouteAccess({ allowedRoles: ["owner"] }, dependencies),
    ).rejects.toMatchObject({ options: { to: ROUTES.login } });
    expect(dependencies.clearSession).toHaveBeenCalledOnce();
  });

  it("preserves the session when the user lookup fails for another reason", async () => {
    const dependencies = makeDependencies(makeUser("owner"));
    const error = new Error("Network unavailable");
    dependencies.getUser.mockRejectedValue(error);

    await expect(
      requireRouteAccess({ allowedRoles: ["owner"] }, dependencies),
    ).rejects.toBe(error);
    expect(dependencies.clearSession).not.toHaveBeenCalled();
  });
});
