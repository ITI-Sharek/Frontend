import { z } from "zod";

const requirementSchema = z.object({
  id: z.string(),
  kind: z.enum(["required", "preferred"]),
  position: z.number().int().nonnegative(),
  text: z.string(),
});

export const contributionRequestSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  requiredRequirements: z.array(requirementSchema),
  preferredRequirements: z.array(requirementSchema),
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
