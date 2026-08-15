import { getApiErrorMetadata } from "@/shared/utils/get-api-error-code";

import type { BlockingSkillDto, ProficiencyLevel } from "../types/eligibility.types";

const LEVELS: readonly string[] = ["beginner", "intermediate", "advanced"];
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLevel(value: unknown): value is ProficiencyLevel {
  return typeof value === "string" && LEVELS.includes(value);
}

/**
 * Pull the blocking skills out of a `403` submission refusal.
 *
 * This is the TOCTOU path: eligibility changed between the page rendering and
 * the submit, so the server refused what the page believed was allowed. The
 * payload carries everything needed to explain it, which is why the block can
 * be shown in full without a second request.
 *
 * Validated rather than cast. A malformed payload returns `null` so the caller
 * falls back to the generic error instead of rendering a half-built explanation
 * with `undefined` where a level should be.
 */
export function readBlockingSkills(error: unknown): BlockingSkillDto[] | null {
  // Read through the shared helper rather than reaching into the response by
  // hand: it is the one place that knows the backend error envelope, and it
  // rejects anything that is not actually an axios error.
  const metadata = getApiErrorMetadata(error)?.blockingSkills;

  if (!Array.isArray(metadata) || metadata.length === 0) return null;

  const skills: BlockingSkillDto[] = [];
  for (const entry of metadata) {
    if (typeof entry !== "object" || entry === null) return null;
    const { skillName, requiredLevel, contributorLevel } = entry as Record<
      string,
      unknown
    >;
    if (typeof skillName !== "string" || !skillName) return null;
    if (!isLevel(requiredLevel)) return null;
    if (contributorLevel !== null && !isLevel(contributorLevel)) return null;
    skills.push({ skillName, requiredLevel, contributorLevel });
  }
  return skills;
}

/** The durable refusal handle used by the block-triggered guidance workflow. */
export function readEligibilityEvaluationId(error: unknown): string | null {
  const value = getApiErrorMetadata(error)?.eligibilityEvaluationId;
  return typeof value === "string" && UUID_V4.test(value) ? value : null;
}
