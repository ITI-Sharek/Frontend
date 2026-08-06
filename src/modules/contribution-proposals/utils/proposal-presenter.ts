import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Undo2,
} from "lucide-react";

import type {
  ContributionProposalStatus,
  ResultingContributionRequestStatus,
} from "../types/contribution-proposal.types";

export const PROPOSAL_STATUS_META = {
  PENDING: {
    label: "بانتظار رد صاحب المشروع",
    description: "المقترح خاص بينك وبين صاحب المشروع ويمكن سحبه قبل الرد النهائي.",
    tone: "waiting" as const,
    icon: CircleDashed,
  },
  ACCEPTED: {
    label: "قُبل كمسودة منسوبة",
    description: "أنشأ القبول مسودة يملكها صاحب المشروع، من دون إسناد عمل أو أولوية اختيار.",
    tone: "positive" as const,
    icon: CircleCheck,
  },
  DECLINED: {
    label: "اعتذر صاحب المشروع",
    description: "انتهى المقترح مع حفظ النسخ والملاحظات كسجل خاص.",
    tone: "negative" as const,
    icon: CircleX,
  },
  WITHDRAWN: {
    label: "سُحب بواسطة المساهم",
    description: "انتهى المقترح بناءً على اختيار صاحبه ولا يمكن إرسال نسخة جديدة.",
    tone: "neutral" as const,
    icon: Undo2,
  },
} satisfies Record<
  ContributionProposalStatus,
  {
    label: string;
    description: string;
    tone: "neutral" | "waiting" | "positive" | "negative";
    icon: typeof CircleCheck;
  }
>;

export const RESULTING_REQUEST_COPY: Record<
  ResultingContributionRequestStatus,
  string
> = {
  DRAFT: "المسودة الناتجة ما زالت خاصة بصاحب المشروع.",
  PUBLISHED: "نُشر طلب المساهمة مع إظهار الإسناد المعنوي المعتمد.",
  ASSIGNED: "أُسند طلب المساهمة بعد نشره؛ الإسناد مستقل عن صاحب المقترح.",
  CANCELLED: "ألغى صاحب المشروع طلب المساهمة الناتج مع بقاء الإسناد المعنوي محفوظًا.",
  DISCARDED: "تخلّى صاحب المشروع عن المسودة الناتجة؛ المقترح لا يُفتح من جديد.",
};

export function formatProposalDate(value: string): string {
  return new Date(value).toLocaleString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Owner-facing label for whoever sent a proposal. The username is optional on
 * the contract, so it is appended only when present rather than rendering a
 * bare "@".
 */
export function formatProposerLabel(
  proposerName: string,
  proposerUsername: string | null,
): string {
  return proposerUsername
    ? `${proposerName} · @${proposerUsername}`
    : proposerName;
}
