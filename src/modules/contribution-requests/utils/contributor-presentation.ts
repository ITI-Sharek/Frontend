import type {
  ContributionRequestDifficulty,
  ContributionRequestRewardDto,
} from "../types/contribution-request.types";

export const CONTRIBUTION_REQUEST_DIFFICULTY_LABELS: Record<
  ContributionRequestDifficulty,
  string
> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export function formatContributionDateTime(value: string | null): string {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatContributionDate(value: string | null): string {
  if (!value) return "غير محدد";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "غير محدد";
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export function formatContributionReward(
  reward: ContributionRequestRewardDto | null,
): string {
  return reward
    ? `${reward.amount.toLocaleString("ar-EG")} ${reward.currency}`
    : "غير معلنة";
}
