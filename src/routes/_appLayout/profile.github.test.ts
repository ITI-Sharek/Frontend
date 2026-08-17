import { describe, expect, it } from "vitest";

import { requireMemberRoute } from "@/modules/auth";

import { Route } from "./profile.github";

describe("GitHub connections route", () => {
  it("allows owners and contributors to manage GitHub access", () => {
    expect(Route.options.beforeLoad).toBe(requireMemberRoute);
  });
});
