import type { ContributorExperienceRange } from "../types/contributor-profile.types";

export const EXPERIENCE_RANGE_LABELS = {
  zero_to_one: "0-1 سنة",
  two_to_four: "2-4 سنوات",
  five_to_ten: "5-10 سنوات",
  ten_plus: "10+ سنوات",
};

export function getExperienceRangeLabel(
  value: ContributorExperienceRange | null,
): string | null {
  if (value === null) return null;
  return EXPERIENCE_RANGE_LABELS[value];
}
