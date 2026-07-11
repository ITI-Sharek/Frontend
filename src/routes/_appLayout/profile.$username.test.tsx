import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes.config";
import { ContributorProfileError } from "@/modules/contributors";
import { beforeLoadContributorProfile, Route } from "./profile.$username";
import { shouldRedirectUnauthenticatedProfile } from "./profile-auth.helpers";
import { getProfileRouteState } from "./profile-route-state";

describe("profile route state", () => {
  it("returns loading while profile is pending", () => {
    expect(
      getProfileRouteState({ isPending: true, hasData: false, error: null }),
    ).toBe("loading");
  });

  it("returns not-found for unknown usernames", () => {
    expect(
      getProfileRouteState({
        isPending: false,
        hasData: false,
        error: new ContributorProfileError("Missing", "not-found"),
      }),
    ).toBe("not-found");
  });

  it("returns unauthenticated for expired or invalid profile sessions", () => {
    expect(
      getProfileRouteState({
        isPending: false,
        hasData: false,
        error: new ContributorProfileError("Login required", "unauthenticated"),
      }),
    ).toBe("unauthenticated");
  });
});

describe("profile route auth guard", () => {
  it("does not redirect during server rendering", () => {
    expect(
      shouldRedirectUnauthenticatedProfile({
        isBrowser: false,
        getAccessToken: () => null,
      }),
    ).toBe(false);
  });

  it("redirects browser users without a stored access token", () => {
    expect(
      shouldRedirectUnauthenticatedProfile({
        isBrowser: true,
        getAccessToken: () => null,
      }),
    ).toBe(true);
  });

  it("allows browser users with a stored access token", () => {
    expect(
      shouldRedirectUnauthenticatedProfile({
        isBrowser: true,
        getAccessToken: () => "access-token",
      }),
    ).toBe(false);
  });

  it("wires the profile route beforeLoad guard", () => {
    expect(Route.options.beforeLoad).toBe(beforeLoadContributorProfile);
  });

  it("redirects unauthenticated browser users from the route beforeLoad", () => {
    const previousWindow = globalThis.window;
    const previousLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
      },
    });

    try {
      expect(() => beforeLoadContributorProfile()).toThrow(
        expect.objectContaining({
          options: expect.objectContaining({ to: ROUTES.login }),
        }),
      );
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previousWindow,
      });
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: previousLocalStorage,
      });
    }
  });
});
