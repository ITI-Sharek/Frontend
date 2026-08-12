import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Undo2,
} from "lucide-react";
import type { TFunction } from "i18next";

import type {
  ContributionProposalStatus,
  ResultingContributionRequestStatus,
} from "../types/contribution-proposal.types";

export function getProposalStatusMeta(t: TFunction) {
  return {
    PENDING: {
      label: t("proposalStatus.pending"),
      description: t("proposalStatus.pendingDescription"),
      tone: "waiting" as const,
      icon: CircleDashed,
    },
    ACCEPTED: {
      label: t("proposalStatus.accepted"),
      description: t("proposalStatus.acceptedDescription"),
      tone: "positive" as const,
      icon: CircleCheck,
    },
    DECLINED: {
      label: t("proposalStatus.declined"),
      description: t("proposalStatus.declinedDescription"),
      tone: "negative" as const,
      icon: CircleX,
    },
    WITHDRAWN: {
      label: t("proposalStatus.withdrawn"),
      description: t("proposalStatus.withdrawnDescription"),
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
}

export function getResultingRequestCopy(
  t: TFunction,
): Record<ResultingContributionRequestStatus, string> {
  return {
    DRAFT: t("proposalResult.draft"),
    PUBLISHED: t("proposalResult.published"),
    ASSIGNED: t("proposalResult.assigned"),
    CANCELLED: t("proposalResult.cancelled"),
    DISCARDED: t("proposalResult.discarded"),
  };
}

export function formatProposalDate(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale, {
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
