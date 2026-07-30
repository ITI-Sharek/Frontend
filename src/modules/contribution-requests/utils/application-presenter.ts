import {
  Ban,
  CircleCheck,
  CircleDashed,
  Clock3,
  Hand,
  UserRoundX,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";

import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type {
  ApplicationDto,
  ApplicationStatus,
} from "../types/application.types";

interface ApplicationStatusMeta {
  label: string;
  title: string;
  description: string;
  neutralEffect: string | null;
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
}

const STATUS_META: Record<ApplicationStatus, ApplicationStatusMeta> = {
  PENDING_OWNER_REVIEW: {
    label: "بانتظار قرار المالك",
    title: "طلب التقديم قيد المراجعة",
    description:
      "وصل طلب التقديم إلى صاحب المشروع، والاختيار قرار بشري لا يتوقف على تقييم آلي.",
    neutralEffect: null,
    tone: "waiting",
    icon: Clock3,
  },
  ACCEPTED: {
    label: "تم الاختيار",
    title: "اختارك صاحب المشروع",
    description:
      "أُنشئ إسناد العمل وفق مدة التسليم المقترحة في طلب التقديم.",
    neutralEffect: null,
    tone: "positive",
    icon: CircleCheck,
  },
  DECLINED_BY_OWNER: {
    label: "لم يختر المالك هذا الطلب",
    title: "اتخذ صاحب المشروع قرارًا بشأن هذا الطلب",
    description:
      "هذا قرار بشري يخص طلب التقديم وسياق طلب المساهمة فقط.",
    neutralEffect:
      "لا يؤثر هذا القرار في ملفك أو أهليتك أو سمعتك أو طلبات تقديم أخرى.",
    tone: "neutral",
    icon: UserRoundX,
  },
  NOT_SELECTED: {
    label: "تم اختيار مساهم آخر",
    title: "أُغلق طلب التقديم بعد اختيار مساهم آخر",
    description:
      "هذه نتيجة نظامية بعد قبول طلب تقديم آخر، وليست رفضًا من المالك أو حكمًا على قدراتك.",
    neutralEffect:
      "لا تؤثر هذه النتيجة في ملفك أو أهليتك أو سمعتك أو طلبات تقديم أخرى.",
    tone: "neutral",
    icon: CircleDashed,
  },
  EXPIRED: {
    label: "انتهت فترة المراجعة",
    title: "انتهى طلب التقديم دون قرار من المالك",
    description:
      "انتهت نافذة مراجعة المالك تلقائيًا. هذه النتيجة ليست رفضًا من صاحب المشروع.",
    neutralEffect:
      "لا يؤثر انتهاء المراجعة في ملفك أو أهليتك أو سمعتك.",
    tone: "neutral",
    icon: Clock3,
  },
  WITHDRAWN: {
    label: "تم السحب",
    title: "سحبت طلب التقديم",
    description:
      "أنهيت هذا الطلب قبل تسجيل قرار من صاحب المشروع.",
    neutralEffect:
      "لا يؤثر السحب في ملفك أو أهليتك أو سمعتك.",
    tone: "neutral",
    icon: Hand,
  },
  REQUEST_CANCELLED: {
    label: "أُلغي طلب المساهمة",
    title: "انتهى طلب التقديم بسبب إلغاء العمل",
    description:
      "ألغى صاحب المشروع طلب المساهمة؛ هذه النتيجة لا تصف جودة طلب تقديمك.",
    neutralEffect:
      "لا يؤثر إلغاء العمل في ملفك أو أهليتك أو سمعتك.",
    tone: "neutral",
    icon: Ban,
  },
};

export function getApplicationStatusMeta(
  status: ApplicationStatus,
): ApplicationStatusMeta {
  return STATUS_META[status];
}

export function getApplicationReviewTiming(application: ApplicationDto): {
  label: string;
  detail: string | null;
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
} {
  if (application.status !== "PENDING_OWNER_REVIEW") {
    return {
      label: getApplicationStatusMeta(application.status).label,
      detail: application.expiredAt
        ? `انتهت في ${formatApplicationDate(application.expiredAt)}`
        : null,
      tone: getApplicationStatusMeta(application.status).tone,
      icon: getApplicationStatusMeta(application.status).icon,
    };
  }
  if (application.overdue) {
    return {
      label: "تحتاج قرارًا الآن",
      detail: application.expiresAt
        ? `تنتهي فترة المراجعة في ${formatApplicationDate(application.expiresAt)}`
        : null,
      tone: "attention",
      icon: XCircle,
    };
  }
  return {
    label: "بانتظار المراجعة",
    detail: application.reviewDueAt
      ? `موعد متابعة المراجعة ${formatApplicationDate(application.reviewDueAt)}`
      : null,
    tone: "waiting",
    icon: Clock3,
  };
}

export function formatApplicationDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}
