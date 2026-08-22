import { describe, expect, it } from "vitest";

import type { SuggestedRepository } from "../schemas/import-project-stepper.schema";
import {
  buildQueuedMaterials,
  deriveMaterialTitle,
  filterSuggestedRepositories,
  isHeroImageSelectionValid,
} from "./import-project-stepper.helpers";

const repos: SuggestedRepository[] = [
  { fullName: "facebook/react", description: null, isPrivate: false },
  { fullName: "vercel/next.js", description: "The React framework", isPrivate: false },
  { fullName: "org/internal-tool", description: null, isPrivate: true },
];

describe("filterSuggestedRepositories", () => {
  it("returns everything for an empty search", () => {
    expect(filterSuggestedRepositories(repos, "")).toEqual(repos);
  });

  it("matches substrings of the full name case-insensitively", () => {
    expect(
      filterSuggestedRepositories(repos, "REACT").map((r) => r.fullName),
    ).toEqual(["facebook/react"]);
    expect(
      filterSuggestedRepositories(repos, "vercel/").map((r) => r.fullName),
    ).toEqual(["vercel/next.js"]);
  });

  it("returns nothing when no name matches", () => {
    expect(filterSuggestedRepositories(repos, "ember")).toEqual([]);
  });
});

describe("isHeroImageSelectionValid", () => {
  it.each(["image/png", "image/jpeg", "image/webp"])(
    "accepts a small %s file",
    (type) => {
      const file = new File(["x"], "hero", { type });
      expect(isHeroImageSelectionValid(file)).toBe(true);
    },
  );

  it("rejects unsupported mime types", () => {
    const file = new File(["x"], "hero.gif", { type: "image/gif" });
    expect(isHeroImageSelectionValid(file)).toBe(false);
  });

  it("accepts exactly 5 MB and rejects anything larger", () => {
    const atLimit = new File([new Uint8Array(5_000_000)], "hero.png", {
      type: "image/png",
    });
    const overLimit = new File([new Uint8Array(5_000_001)], "hero.png", {
      type: "image/png",
    });
    expect(isHeroImageSelectionValid(atLimit)).toBe(true);
    expect(isHeroImageSelectionValid(overLimit)).toBe(false);
  });
});

describe("deriveMaterialTitle", () => {
  it("strips the extension and separator characters", () => {
    expect(deriveMaterialTitle("onboarding-guide.md")).toBe("onboarding guide");
    expect(deriveMaterialTitle("setup_notes.PDF")).toBe("setup notes");
    expect(deriveMaterialTitle("my_file-final.txt")).toBe("my file final");
  });

  it("keeps names without an extension as-is", () => {
    expect(deriveMaterialTitle("README")).toBe("README");
  });
});

describe("buildQueuedMaterials", () => {
  it("returns an empty queue for no files", () => {
    expect(buildQueuedMaterials(null)).toEqual([]);
    expect(buildQueuedMaterials([])).toEqual([]);
  });

  it("queues each file as public with a derived title", () => {
    const guide = new File(["guide"], "architecture-guide.md", {
      type: "text/markdown",
    });
    const readme = new File(["readme"], "README.txt", { type: "text/plain" });

    const queued = buildQueuedMaterials([guide, readme]);

    expect(queued).toHaveLength(2);
    expect(queued[0]).toMatchObject({
      file: guide,
      title: "architecture guide",
      visibility: "PUBLIC",
    });
    expect(queued[1]).toMatchObject({
      file: readme,
      title: "README",
      visibility: "PUBLIC",
    });
  });

  it("mints unique ids seeded from the file name", () => {
    const file = new File(["x"], "notes.md", { type: "text/markdown" });
    const [first, second] = [
      ...buildQueuedMaterials([file]),
      ...buildQueuedMaterials([file]),
    ];
    expect(first.id).toMatch(/^notes\.md-\d+-[a-z0-9]{5}$/);
    expect(first.id).not.toBe(second.id);
  });
});
