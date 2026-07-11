import { describe, expect, it } from "vitest";

import type { AuthUserDto } from "@/modules/auth";
import { shouldEnsureContributorProfile } from "./login.helpers";

function makeUser(role: AuthUserDto["role"]): AuthUserDto {
  return {
    id: "user-1",
    email: "user@example.com",
    username: "sara",
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

describe("login route contributor orchestration", () => {
  it("requires profile ensure for contributor users", () => {
    expect(shouldEnsureContributorProfile(makeUser("contributor"))).toBe(true);
  });

  it("does not require profile ensure for non-contributor users", () => {
    expect(shouldEnsureContributorProfile(makeUser("owner"))).toBe(false);
    expect(shouldEnsureContributorProfile(makeUser("admin"))).toBe(false);
  });
});
