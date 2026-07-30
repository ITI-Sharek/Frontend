import { describe, expect, it } from "vitest";

import { requireOwnerRoute } from "@/modules/auth";

import { Route as detailRoute } from "./contribution-requests.$requestId";
import { Route as listRoute } from "./my-projects.$projectId.contribution-requests.index";
import { Route as createRoute } from "./my-projects.$projectId.contribution-requests.new";

describe("owner Contribution Request routes", () => {
  it("guards list, create, and lifecycle detail routes as owner-only", () => {
    expect(listRoute.options.beforeLoad).toBe(requireOwnerRoute);
    expect(createRoute.options.beforeLoad).toBe(requireOwnerRoute);
    expect(detailRoute.options.beforeLoad).toBe(requireOwnerRoute);
  });

  it("keeps each lifecycle screen composed at a distinct route", () => {
    expect(listRoute.options.component).not.toBe(detailRoute.options.component);
    expect(createRoute.options.component).not.toBe(
      detailRoute.options.component,
    );
  });
});
