import { describe, expect, it } from "vitest";

import { validateMyProjectsSearch } from "./my-projects.index";

describe("validateMyProjectsSearch", () => {
  it("extracts and trims search query", () => {
    expect(validateMyProjectsSearch({ q: "  sharek api  " })).toEqual({
      q: "sharek api",
    });
  });

  it("ignores empty or whitespace-only search query", () => {
    expect(validateMyProjectsSearch({ q: "   " })).toEqual({});
  });

  it("extracts valid status filters", () => {
    expect(validateMyProjectsSearch({ status: "published" })).toEqual({
      status: "published",
    });
    expect(validateMyProjectsSearch({ status: "draft" })).toEqual({
      status: "draft",
    });
    expect(validateMyProjectsSearch({ status: "archived" })).toEqual({
      status: "archived",
    });
  });

  it("ignores invalid status filters", () => {
    expect(validateMyProjectsSearch({ status: "invalid_status" })).toEqual({});
    expect(validateMyProjectsSearch({ status: 123 })).toEqual({});
  });

  it("handles combined status and query", () => {
    expect(
      validateMyProjectsSearch({ status: "published", q: "frontend" }),
    ).toEqual({
      status: "published",
      q: "frontend",
    });
  });
});
