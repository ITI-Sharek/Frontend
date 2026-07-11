import { describe, expect, it } from "vitest";

import { ContributorProfileError } from "@/modules/contributors";
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

  it("returns error for unauthenticated access", () => {
    expect(
      getProfileRouteState({
        isPending: false,
        hasData: false,
        error: new ContributorProfileError("Login required", "unauthenticated"),
      }),
    ).toBe("error");
  });
});
