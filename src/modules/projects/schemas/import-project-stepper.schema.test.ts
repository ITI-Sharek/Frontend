import { describe, expect, it } from "vitest";

import {
  HERO_IMAGE_ACCEPTED_MIME_TYPES,
  HERO_IMAGE_MAX_BYTES,
  publishedProjectSchema,
  queuedMaterialSchema,
  suggestedRepositorySchema,
} from "./import-project-stepper.schema";

describe("queuedMaterialSchema", () => {
  it("parses a queued material with a real File", () => {
    const material = {
      id: "notes-123-abcde",
      file: new File(["x"], "notes.md", { type: "text/markdown" }),
      title: "notes",
      visibility: "PUBLIC",
    };
    expect(queuedMaterialSchema.parse(material)).toEqual(material);
  });

  it("rejects an unknown visibility", () => {
    const material = {
      id: "notes",
      file: new File(["x"], "notes.md"),
      title: "notes",
      visibility: "PRIVATE",
    };
    expect(() => queuedMaterialSchema.parse(material)).toThrow();
  });

  it("rejects a non-File payload", () => {
    expect(() =>
      queuedMaterialSchema.parse({
        id: "notes",
        file: { name: "notes.md" },
        title: "notes",
        visibility: "PUBLIC",
      }),
    ).toThrow();
  });
});

describe("suggestedRepositorySchema", () => {
  it("allows a nullable description", () => {
    expect(
      suggestedRepositorySchema.parse({
        fullName: "owner/repo",
        description: null,
        isPrivate: false,
      }),
    ).toEqual({ fullName: "owner/repo", description: null, isPrivate: false });
  });

  it("requires isPrivate", () => {
    expect(() =>
      suggestedRepositorySchema.parse({
        fullName: "owner/repo",
        description: null,
      }),
    ).toThrow();
  });
});

describe("publishedProjectSchema", () => {
  it("requires both id and slug", () => {
    expect(publishedProjectSchema.parse({ id: "p1", slug: "p1-slug" })).toEqual({
      id: "p1",
      slug: "p1-slug",
    });
    expect(() => publishedProjectSchema.parse({ id: "p1" })).toThrow();
  });
});

describe("hero image constraints", () => {
  it("matches the upload contract", () => {
    expect(HERO_IMAGE_ACCEPTED_MIME_TYPES).toEqual([
      "image/png",
      "image/jpeg",
      "image/webp",
    ]);
    expect(HERO_IMAGE_MAX_BYTES).toBe(5_000_000);
  });
});
