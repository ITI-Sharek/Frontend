import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes.config";

import { Route } from "./explore.contributor";

describe("explore contributors route", () => {
  it("uses the singular contributor directory URL", () => {
    expect(ROUTES.exploreContributors).toBe("/explore/contributor");
    expect(Route.options.beforeLoad).toBeDefined();
  });
});
