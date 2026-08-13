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
import { translate } from "@/lib/translate";

import type {
  ContributionRequestDto,
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
  Omit<ContributionRequestStatusMeta, "label"> & { labelKey: string }
> = {
  draft: { tone: "neutral", icon: FileText, labelKey: "draft" },
  published: { tone: "waiting", icon: Radio, labelKey: "published" },
  assigned: { tone: "attention", icon: UserCheck, labelKey: "assigned" },
  completed: { tone: "positive", icon: CheckCircle2, labelKey: "completed" },
  cancelled: { tone: "negative", icon: CircleAlert, labelKey: "cancelled" },
  discarded: { tone: "negative", icon: Trash2, labelKey: "discarded" },
};

export function getContributionRequestStatusMeta(
  status: ContributionRequestStatus,
): ContributionRequestStatusMeta {
  if (status in STATUS_META) {
    const meta = STATUS_META[status as keyof typeof STATUS_META];
    return {
      ...meta,
      label: translate(`contributionRequests.status.${meta.labelKey}`),
    };
  }
  return { tone: "neutral", icon: CircleAlert, label: status };
}

/**
 * Applications Close Time is a time-based condition, not a persisted Request
 * lifecycle transition. Owners still need to see that a published Request no
 * longer accepts new Applications while retaining access to existing ones.
 */
export function isContributionRequestApplicationsClosed(
  request: Pick<ContributionRequestDto, "status" | "applicationsCloseTime">,
  now: Date = new Date(),
): boolean {
  if (request.status !== "published" || !request.applicationsCloseTime) {
    return false;
  }

  const closeTime = new Date(request.applicationsCloseTime);
  return (
    !Number.isNaN(closeTime.getTime()) && closeTime.getTime() <= now.getTime()
  );
}

export function getOwnerContributionRequestStatusMeta(
  request: Pick<ContributionRequestDto, "status" | "applicationsCloseTime">,
  now?: Date,
): ContributionRequestStatusMeta {
  if (isContributionRequestApplicationsClosed(request, now)) {
    return {
      tone: "neutral",
      icon: CircleAlert,
      label: translate("contributionRequests.status.applicationsClosed"),
    };
  }

  return getContributionRequestStatusMeta(request.status);
}
