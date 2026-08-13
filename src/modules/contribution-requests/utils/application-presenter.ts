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
import { activeLocale, translate } from "@/lib/translate";

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

function getStatusMeta(): Record<ApplicationStatus, ApplicationStatusMeta> {
 return {
  PENDING_OWNER_REVIEW: {
    label: translate("application.presenter.pending.label"),
    title: translate("application.presenter.pending.title"),
    description: translate("application.presenter.pending.description"),
    neutralEffect: null,
    tone: "waiting",
    icon: Clock3,
  },
  ACCEPTED: {
    label: translate("application.presenter.accepted.label"),
    title: translate("application.presenter.accepted.title"),
    description: translate("application.presenter.accepted.description"),
    neutralEffect: null,
    tone: "positive",
    icon: CircleCheck,
  },
  DECLINED_BY_OWNER: {
    label: translate("application.presenter.declined.label"),
    title: translate("application.presenter.declined.title"),
    description: translate("application.presenter.declined.description"),
    neutralEffect: translate("application.presenter.declined.neutralEffect"),
    tone: "neutral",
    icon: UserRoundX,
  },
  NOT_SELECTED: {
    label: translate("application.presenter.notSelected.label"),
    title: translate("application.presenter.notSelected.title"),
    description: translate("application.presenter.notSelected.description"),
    neutralEffect: translate("application.presenter.notSelected.neutralEffect"),
    tone: "neutral",
    icon: CircleDashed,
  },
  EXPIRED: {
    label: translate("application.presenter.expired.label"),
    title: translate("application.presenter.expired.title"),
    description: translate("application.presenter.expired.description"),
    neutralEffect: translate("application.presenter.expired.neutralEffect"),
    tone: "neutral",
    icon: Clock3,
  },
  WITHDRAWN: {
    label: translate("application.presenter.withdrawn.label"),
    title: translate("application.presenter.withdrawn.title"),
    description: translate("application.presenter.withdrawn.description"),
    neutralEffect: translate("application.presenter.withdrawn.neutralEffect"),
    tone: "neutral",
    icon: Hand,
  },
  REQUEST_CANCELLED: {
    label: translate("application.presenter.cancelled.label"),
    title: translate("application.presenter.cancelled.title"),
    description: translate("application.presenter.cancelled.description"),
    neutralEffect: translate("application.presenter.cancelled.neutralEffect"),
    tone: "neutral",
    icon: Ban,
  },
  };
}

export function getApplicationStatusMeta(
  status: ApplicationStatus,
): ApplicationStatusMeta {
  return getStatusMeta()[status];
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
        ? translate("application.presenter.expiredAt", { date: formatApplicationDate(application.expiredAt) })
        : null,
      tone: getApplicationStatusMeta(application.status).tone,
      icon: getApplicationStatusMeta(application.status).icon,
    };
  }
  if (application.overdue) {
    return {
      label: translate("application.presenter.overdue.label"),
      detail: application.expiresAt
        ? translate("application.presenter.overdue.detail", { date: formatApplicationDate(application.expiresAt) })
        : null,
      tone: "attention",
      icon: XCircle,
    };
  }
  return {
    label: translate("application.presenter.awaiting.label"),
    detail: application.reviewDueAt
      ? translate("application.presenter.awaiting.detail", { date: formatApplicationDate(application.reviewDueAt) })
      : null,
    tone: "waiting",
    icon: Clock3,
  };
}

export function formatApplicationDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(activeLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}
