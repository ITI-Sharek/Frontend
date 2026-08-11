import { describe, expect, it } from "vitest";

import { requireMemberRoute } from "@/modules/auth";

import { Route } from "./applications.$applicationId";

describe("Application notification route", () => {
  it("allows the member route to redirect owners to their request review screen", () => {
    expect(Route.options.beforeLoad).toBe(requireMemberRoute);
  });
});
