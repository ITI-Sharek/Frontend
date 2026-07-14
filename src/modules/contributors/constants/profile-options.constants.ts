/**
 * Mirrors the value taxonomy in modules/auth/constants/signup.constants.ts
 * (EXPERIENCE_OPTIONS / INTEREST_OPTIONS). Duplicated rather than imported —
 * a module must never import another module directly; both sides agree on
 * the same value strings by convention.
 */
export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "أقل من سنة",
  mid: "1 - 3 سنوات",
  senior: "3 - 5 سنوات",
  expert: "أكثر من 5 سنوات",
};

export const INTEREST_LABELS: Record<string, string> = {
  web: "تطوير الويب",
  mobile: "تطبيقات الجوال",
  ai: "الذكاء الاصطناعي",
  design: "تصميم UI/UX",
  devops: "DevOps",
  docs: "توثيق ومحتوى",
};

export function getExperienceLevelLabel(value: string | null): string | null {
  if (value === null) return null;
  return EXPERIENCE_LEVEL_LABELS[value] ?? value;
}

export function getInterestLabel(value: string): string {
  return INTEREST_LABELS[value] ?? value;
}
