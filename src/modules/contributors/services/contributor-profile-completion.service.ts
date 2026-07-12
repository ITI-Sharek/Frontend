import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * MOCK IMPLEMENTATIONS.
 *
 * The backend exposes only `POST /contributors/profiles/me/ensure` and
 * `GET /contributors/profiles/:username` today — there is no profile-update
 * or skills-generation endpoint yet. Both are specified for the backend in
 * docs/design/api-contract-additions.md (§profile completion) and tracked in
 * docs/design/implementation-impact.md.
 *
 * Cutover: replace the bodies with the real axios calls
 * (`PATCH /contributors/profiles/me`, `POST /skill-profiles/me/generate`)
 * and delete the simulated latency. Callers (mutation hooks / components)
 * need no changes — they already consume the agreed contract shapes.
 */

export interface UpdateProfileDetailsPayload {
  bio: string | null;
  availability: string | null;
}

function mockNetworkDelay(): Promise<void> {
  const ms = 400 + Math.round(Math.random() * 400);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function updateContributorProfileDetails(
  current: ContributorProfileDto,
  payload: UpdateProfileDetailsPayload,
): Promise<ContributorProfileDto> {
  await mockNetworkDelay();

  const bio = payload.bio?.trim() || null;
  const availability = payload.availability?.trim() || null;

  return {
    ...current,
    bio,
    availability,
    completionPrompts: current.completionPrompts.filter(
      (prompt) => prompt !== "add_bio" || bio === null,
    ),
  };
}

export interface SkillsGenerationRequestResult {
  status: "queued";
  message: string;
}

export async function requestSkillsGeneration(): Promise<SkillsGenerationRequestResult> {
  await mockNetworkDelay();

  return {
    status: "queued",
    message:
      "بدأ تحليل نشاطك على GitHub. ستظهر المهارات هنا بعد اكتمال التحليل ومراجعة الفريق.",
  };
}
