import { z } from "zod";

const requirementSchema = z.object({
  id: z.string(),
  kind: z.enum(["required", "preferred"]),
  position: z.number().int().nonnegative(),
  text: z.string(),
});

const skillRequirementSchema = z.object({
  id: z.string(),
  skillName: z.string(),
  requiredLevel: z.enum(["beginner", "intermediate", "advanced"]),
  kind: z.enum(["required", "preferred"]),
  source: z.enum(["ai_inferred", "owner_override"]).default("owner_override"),
  confidence: z.enum(["low", "medium", "high"]).nullable().default(null),
  position: z.number().int().nonnegative().default(0),
});

export const contributionRequestSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  requiredRequirements: z.array(requirementSchema),
  preferredRequirements: z.array(requirementSchema),
  skillRequirements: z.array(skillRequirementSchema).default([]),
  skillInferenceStatus: z
    .enum(["not_started", "pending", "succeeded", "failed"])
    .default("not_started"),
  technologyTags: z.array(z.string()),
  applicationsCloseTime: z.string().nullable(),
  targetCompletionDate: z.string().nullable(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
  reward: z.string().nullable(),
  rewardCurrency: z.string().nullable(),
  status: z.enum([
    "draft",
    "published",
    "assigned",
    "in_progress",
    "awaiting_delivery",
    "delivery_submitted",
    "completed",
    "cancelled",
    "expired",
    "discarded",
  ]),
  attribution: z
    .object({
      proposalId: z.string(),
      contributorId: z.string(),
      contributorName: z.string(),
      contributorUsername: z.string().nullable(),
    })
    .nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ownerProjectContributionRequestsSchema = z.object({
  projectId: z.string(),
  totalCount: z.number().int().nonnegative(),
  byStatus: z.object({
    draft: z.array(contributionRequestSchema),
    published: z.array(contributionRequestSchema),
    assigned: z.array(contributionRequestSchema),
    completed: z.array(contributionRequestSchema),
    cancelled: z.array(contributionRequestSchema),
    discarded: z.array(contributionRequestSchema),
  }),
});
