import {
  CheckCircle2,
  CircleAlert,
  FileText,
  Radio,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { ComponentType } from "react";

import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type {
  ContributionRequestStatus,
  ContributionRequestsByStatusDto,
} from "../types/contribution-request.types";

interface ContributionRequestStatusMeta {
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const STATUS_META: Record<
  keyof ContributionRequestsByStatusDto,
  ContributionRequestStatusMeta
> = {
  draft: { tone: "neutral", icon: FileText, label: "مسودة" },
  published: { tone: "waiting", icon: Radio, label: "منشور" },
  assigned: { tone: "attention", icon: UserCheck, label: "مُسنَد" },
  completed: { tone: "positive", icon: CheckCircle2, label: "مكتمل" },
  cancelled: { tone: "negative", icon: CircleAlert, label: "مُلغى" },
  discarded: { tone: "negative", icon: Trash2, label: "تم التجاهل" },
};

export function getContributionRequestStatusMeta(
  status: ContributionRequestStatus,
): ContributionRequestStatusMeta {
  if (status in STATUS_META) {
    return STATUS_META[status as keyof typeof STATUS_META];
  }
  return { tone: "neutral", icon: CircleAlert, label: status };
}
