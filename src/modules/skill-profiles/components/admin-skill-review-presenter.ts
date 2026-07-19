import type {
  PendingSkillReviewItemDto,
  SkillProfileReviewProficiency,
} from "../types/admin-skill-review.types";

export interface ContributorReviewGroup {
  contributorId: string;
  contributorName: string;
  contributorUsername: string | null;
  oldestCreatedAt: string;
  averageConfidence: number;
  skills: PendingSkillReviewItemDto[];
}

export const PROFICIENCY_LABEL: Record<SkillProfileReviewProficiency, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export function groupPendingSkillReviews(
  items: PendingSkillReviewItemDto[],
): ContributorReviewGroup[] {
  const groups = new Map<string, PendingSkillReviewItemDto[]>();
  for (const item of items) {
    groups.set(item.contributorId, [
      ...(groups.get(item.contributorId) ?? []),
      item,
    ]);
  }

  return Array.from(groups.entries())
    .map(([contributorId, skills]) => {
      const sortedSkills = [...skills].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      return {
        contributorId,
        contributorName: sortedSkills[0]?.contributorName ?? "مساهم",
        contributorUsername: sortedSkills[0]?.contributorUsername ?? null,
        oldestCreatedAt: sortedSkills[0]?.createdAt ?? "",
        averageConfidence:
          sortedSkills.reduce((sum, skill) => sum + skill.confidence, 0) /
          Math.max(sortedSkills.length, 1),
        skills: sortedSkills,
      };
    })
    .sort(
      (a, b) =>
        new Date(a.oldestCreatedAt).getTime() -
        new Date(b.oldestCreatedAt).getTime(),
    );
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatWaitingAge(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "غير معروف";
  const hours = Math.max(0, Math.floor((Date.now() - created) / 3_600_000));
  if (hours < 1) return "أقل من ساعة";
  if (hours < 24) return `${hours} ساعة`;
  return `${Math.floor(hours / 24)} يوم`;
}

export function getAgingBand(createdAt: string): "normal" | "due" | "overdue" | "critical" {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "normal";
  const hours = Math.max(0, (Date.now() - created) / 3_600_000);
  if (hours < 24) return "normal";
  if (hours < 48) return "due";
  if (hours < 72) return "overdue";
  return "critical";
}

export function renderEvidenceSources(evidenceSources: unknown): string {
  if (evidenceSources === null || evidenceSources === undefined) {
    return "لا توجد مصادر مفصلة.";
  }

  if (typeof evidenceSources === "string") return evidenceSources;

  if (typeof evidenceSources === "object") {
    const maybeIds = (evidenceSources as { evidenceIds?: unknown }).evidenceIds;
    if (Array.isArray(maybeIds)) {
      return maybeIds.map(String).join(" · ");
    }
  }

  return JSON.stringify(evidenceSources);
}
