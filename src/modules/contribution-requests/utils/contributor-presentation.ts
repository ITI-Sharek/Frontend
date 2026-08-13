import type {
  ContributionRequestDifficulty,
  ContributionRequestRewardDto,
} from "../types/contribution-request.types";
import { activeLocale, translate } from "@/lib/translate";

const DIFFICULTIES: ContributionRequestDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export function getContributionRequestDifficulties() {
  return DIFFICULTIES.map((value) => ({
    value,
    label: translate(`contributionRequests.form.difficulties.${value}`),
  }));
}

export function getContributionRequestDifficultyLabel(
  value: ContributionRequestDifficulty,
): string {
  return translate(`contributionRequests.form.difficulties.${value}`);
}

export function formatContributionDateTime(value: string | null): string {
  if (!value) return translate("contributionRequests.dateUnspecified");
  return new Intl.DateTimeFormat(activeLocale() === "en" ? "en-US" : "ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatContributionDate(value: string | null): string {
  if (!value) return translate("contributionRequests.dateUnspecified");
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return translate("contributionRequests.dateUnspecified");
  return new Intl.DateTimeFormat(activeLocale() === "en" ? "en-US" : "ar-EG", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export function formatContributionReward(
  reward: ContributionRequestRewardDto | null,
): string {
  return reward
    ? `${reward.amount.toLocaleString(activeLocale() === "en" ? "en-US" : "ar-EG")} ${reward.currency}`
    : translate("contributionRequests.rewardUnspecified");
}
