import { Briefcase, Users } from "lucide-react";

import type { ChipOption, RoleOption } from "../types/signup.types";

export const SIGNUP_STEPS = ["الدور", "بيانات الحساب", "التفاصيل"] as const;

// DEC-001 copy (docs/governance/decision-log.md): the role choice must never
// read as permanent. Arabic translation is a draft pending native-speaker
// review (see docs/design/arabic-glossary.md).
export const ROLE_STEP_DISCLAIMER =
  "اختر طريقة استخدامك لـ Share-k في البداية. قد تتم إضافة أدوار إضافية لاحقًا.";

// POST /auth/register rejects unknown fields and does not accept `username`
// yet (usernames are backend-generated for now). Flip this on once the
// backend implements register-time usernames per DEC-016
// (docs/design/api-contract-additions.md §2) — the field, availability
// check, and tests are already built and wired.
export const REGISTER_USERNAME_FIELD_ENABLED = false as boolean;

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "contributor",
    title: "مساهم",
    description: "أرغب في المساهمة في مشاريع مفتوحة المصدر وتطوير مهاراتي",
    icon: Users,
  },
  {
    value: "owner",
    title: "صاحب مشروع",
    description: "أمتلك مشروعًا أو فكرة وأبحث عن مساهمين لبنائها",
    icon: Briefcase,
  },
];

export const EXPERIENCE_OPTIONS: ChipOption[] = [
  { value: "junior", label: "أقل من سنة" },
  { value: "mid", label: "1 - 3 سنوات" },
  { value: "senior", label: "3 - 5 سنوات" },
  { value: "expert", label: "أكثر من 5 سنوات" },
];

export const TEAM_SIZE_OPTIONS: ChipOption[] = [
  { value: "solo", label: "أعمل بمفردي" },
  { value: "small", label: "2 - 10" },
  { value: "medium", label: "11 - 50" },
  { value: "large", label: "أكثر من 50" },
];

export const AVAILABILITY_OPTIONS: ChipOption[] = [
  { value: "full-time", label: "دوام كامل" },
  { value: "freelance", label: "عمل حر" },
  { value: "both", label: "كلاهما" },
];

export const INTEREST_OPTIONS: ChipOption[] = [
  { value: "web", label: "تطوير الويب" },
  { value: "mobile", label: "تطبيقات الجوال" },
  { value: "ai", label: "الذكاء الاصطناعي" },
  { value: "design", label: "تصميم UI/UX" },
  { value: "devops", label: "DevOps" },
  { value: "docs", label: "توثيق ومحتوى" },
];
