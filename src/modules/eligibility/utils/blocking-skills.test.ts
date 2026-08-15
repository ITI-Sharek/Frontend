import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import {
  readBlockingSkills,
  readEligibilityEvaluationId,
} from "./blocking-skills";

function refusal(metadata: unknown) {
  return new AxiosError("blocked", "403", undefined, undefined, {
    status: 403,
    statusText: "",
    headers: {},
    config: { headers: {} } as never,
    data: {
      statusCode: 403,
      code: "APPLICATION_BLOCKED_SKILL_GAP",
      message: "blocked",
      metadata,
    },
  });
}

describe("readBlockingSkills", () => {
  it("reads the recorded evaluation id used to request guidance", () => {
    expect(
      readEligibilityEvaluationId(
        refusal({
          eligibilityEvaluationId: "11111111-1111-4111-8111-111111111111",
          blockingSkills: [],
        }),
      ),
    ).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("rejects a missing or malformed evaluation id", () => {
    expect(readEligibilityEvaluationId(refusal({}))).toBeNull();
    expect(
      readEligibilityEvaluationId(
        refusal({ eligibilityEvaluationId: "not-an-evaluation-id" }),
      ),
    ).toBeNull();
  });

  it("reads the skills a refusal named", () => {
    const skills = readBlockingSkills(
      refusal({
        blockingSkills: [
          {
            skillName: "React",
            requiredLevel: "advanced",
            contributorLevel: "beginner",
          },
          {
            skillName: "Rust",
            requiredLevel: "intermediate",
            contributorLevel: null,
          },
        ],
      }),
    );

    expect(skills).toEqual([
      {
        skillName: "React",
        requiredLevel: "advanced",
        contributorLevel: "beginner",
      },
      {
        skillName: "Rust",
        requiredLevel: "intermediate",
        contributorLevel: null,
      },
    ]);
  });

  it("keeps a null level rather than coercing it", () => {
    // "No approved evidence" and "level too low" are different situations with
    // different recovery advice; flattening them would make the advice wrong
    // for one of them.
    const skills = readBlockingSkills(
      refusal({
        blockingSkills: [
          {
            skillName: "Rust",
            requiredLevel: "beginner",
            contributorLevel: null,
          },
        ],
      }),
    );
    expect(skills?.[0].contributorLevel).toBeNull();
  });

  it.each([
    ["a non-axios error", new Error("network")],
    ["no metadata", refusal(undefined)],
    ["an empty list", refusal({ blockingSkills: [] })],
    ["a non-array", refusal({ blockingSkills: "React" })],
    [
      "a missing skill name",
      refusal({ blockingSkills: [{ requiredLevel: "advanced", contributorLevel: null }] }),
    ],
    [
      "a level outside the platform vocabulary",
      refusal({
        blockingSkills: [
          { skillName: "React", requiredLevel: "expert", contributorLevel: null },
        ],
      }),
    ],
    [
      "an undefined contributor level",
      refusal({
        blockingSkills: [{ skillName: "React", requiredLevel: "advanced" }],
      }),
    ],
  ])("returns null for %s", (_case, error) => {
    // Validated rather than cast. Returning a half-built list would render an
    // explanation with `undefined` where a level should be — worse than falling
    // back to the generic error.
    expect(readBlockingSkills(error)).toBeNull();
  });

  it("rejects the whole payload when one entry is malformed", () => {
    expect(
      readBlockingSkills(
        refusal({
          blockingSkills: [
            {
              skillName: "React",
              requiredLevel: "advanced",
              contributorLevel: null,
            },
            { skillName: "Rust", requiredLevel: "expert", contributorLevel: null },
          ],
        }),
      ),
    ).toBeNull();
  });
});
