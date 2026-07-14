import { describe, expect, it } from "vitest";

import { getPostLoginPath, ROUTES } from "./routes.config";

describe("route config", () => {
  it("builds encoded contributor profile URLs from usernames", () => {
    expect(ROUTES.contributorProfile("sara ahmed")).toBe("/profile/sara%20ahmed");
  });

  it("exposes the social auth callback route", () => {
    expect(ROUTES.authCallback).toBe("/auth/callback");
  });

  it("routes contributor users to their username profile", () => {
    expect(getPostLoginPath({ role: "contributor", username: "mona" })).toBe(
      "/profile/mona",
    );
  });

  it("routes owner users to their projects list", () => {
    expect(getPostLoginPath({ role: "owner", username: "owner" })).toBe(
      "/my-projects",
    );
  });

  it("keeps other non-contributor users on the existing default destination", () => {
    expect(getPostLoginPath({ role: "admin", username: "admin" })).toBe("/");
  });
});
