import { describe, expect, it } from "vitest";

import { getPostLoginPath, ROUTES } from "./routes.config";

describe("route config", () => {
  it("builds encoded contributor profile URLs from usernames", () => {
    expect(ROUTES.contributorProfile("sara ahmed")).toBe("/profile/sara%20ahmed");
  });

  it("exposes the social auth callback route", () => {
    expect(ROUTES.authCallback).toBe("/auth/callback");
  });

  it("builds admin skill review URLs", () => {
    expect(ROUTES.adminSkillReview("user 1")).toBe(
      "/admin/skill-reviews/user%201",
    );
  });

  it("keeps admin notifications inside the admin workspace", () => {
    expect(ROUTES.adminNotifications).toBe("/admin/notifications");
  });

  it("builds encoded owner Contribution Request routes", () => {
    expect(ROUTES.ownerContributionRequests("project 1")).toBe(
      "/my-projects/project%201/contribution-requests",
    );
    expect(ROUTES.newContributionRequest("project 1")).toBe(
      "/my-projects/project%201/contribution-requests/new",
    );
    expect(ROUTES.contributionRequest("request 1")).toBe(
      "/contribution-requests/request%201",
    );
    expect(ROUTES.application("application 1")).toBe(
      "/applications/application%201",
    );
  });

  it("builds encoded contributor Application routes", () => {
    expect(ROUTES.application("application 1")).toBe(
      "/applications/application%201",
    );
  });

  it("builds encoded Contribution Proposal routes", () => {
    // newProposal is a bare pathname: /proposals/new validates projectId as a
    // search param, which a Link must pass via `search`, not inside `to`.
    expect(ROUTES.newProposal).toBe("/proposals/new");
    expect(ROUTES.proposal("proposal 1")).toBe("/proposals/proposal%201");
  });

  it("builds an encoded public Contribution Request route", () => {
    expect(ROUTES.task("request 1")).toBe("/tasks/request%201");
  });

  it("exposes distinct admin destinations for fields and published owners", () => {
    expect(ROUTES.adminProfileFields).toBe("/admin/profile-fields");
    expect(ROUTES.adminProjectOwners).toBe("/admin/project-owners");
  });

  it("routes contributor users with a profile to their action-ranked dashboard", () => {
    expect(getPostLoginPath({ role: "contributor", username: "mona" })).toBe(
      ROUTES.dashboard,
    );
  });

  it("routes contributors without a profile username to onboarding", () => {
    expect(getPostLoginPath({ role: "contributor", username: null })).toBe(
      ROUTES.onboarding,
    );
  });

  it("routes owner users to the shared workspace home", () => {
    expect(getPostLoginPath({ role: "owner", username: "owner" })).toBe(
      ROUTES.home,
    );
  });

  it("routes admin users to the admin workspace", () => {
    expect(getPostLoginPath({ role: "admin", username: "admin" })).toBe(
      "/admin",
    );
  });
});
