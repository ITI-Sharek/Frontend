import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { AdminIdentityVerificationItemDto } from "@/modules/admin-identity";

import { AdminDashboardHero } from "./admin-dashboard-hero";
import { AdminQuickCreateDialog } from "./admin-quick-create-dialog";
import { AdminOverviewTab } from "./admin-overview-tab";
import { AdminDashboardView } from "./admin-dashboard-view";

const mockMetrics = {
  pendingVerifications: 2,
  verifiedIdentities: 5,
  pendingSkills: 3,
  oldestSkillWait: "2 days",
  totalCategories: 4,
  totalFields: 12,
  totalLevels: 5,
  publishedOwners: 8,
};

const mockPendingVerifications: AdminIdentityVerificationItemDto[] = [
  {
    id: "user-1",
    firstName: "Ahmed",
    lastName: "Ali",
    email: "ahmed@example.com",
    username: "ahmed_ali",
    role: "contributor",
    identityVerificationStatus: "pending",
    identityDocumentMimeType: "application/pdf",
    identityDocumentUpdatedAt: "2026-08-20T10:00:00Z",
    identityVerifiedAt: null,
    identityVerificationRejectedReason: null,
    identityVerifiedBy: null,
    createdAt: "2026-08-20T10:00:00Z",
    avatarUrl: null,
  },
];

vi.mock("@/modules/admin-identity", () => ({
  useAdminIdentityVerificationsQuery: () => ({
    data: {
      items: mockPendingVerifications,
      total: 1,
    },
    isLoading: false,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  AdminIdentityVerificationsPanel: () => (
    <div data-testid="identity-verifications-panel">Identity Verifications Panel</div>
  ),
}));

vi.mock("@/modules/skill-profiles", () => ({
  useAdminPendingSkillReviewsQuery: () => ({
    data: {
      items: [
        {
          id: "review-1",
          contributorId: "contrib-1",
          contributorName: "Sarah Connor",
          contributorUsername: "sconnor",
          skills: [
            {
              id: "skill-1",
              name: "TypeScript",
              claimedProficiency: "intermediate",
              confidence: 0.95,
              evidenceSummary: "15 PRs merged",
            },
          ],
          createdAt: "2026-08-20T08:00:00Z",
        },
      ],
      total: 1,
    },
    isLoading: false,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  formatWaitingAge: () => "1 day",
  groupPendingSkillReviews: () => [
    {
      contributorId: "contrib-1",
      contributorName: "Sarah Connor",
      contributorUsername: "sconnor",
      skills: [{ id: "skill-1", name: "TypeScript" }],
      oldestCreatedAt: "2026-08-20T08:00:00Z",
    },
  ],
  AdminSkillReviewSummary: () => (
    <div data-testid="skill-review-summary">Skill Review Summary</div>
  ),
  AdminSkillReviewQueue: () => (
    <div data-testid="skill-review-queue">Skill Review Queue</div>
  ),
}));

vi.mock("@/modules/contributors", () => ({
  useAdminContributorFieldCategoriesQuery: () => ({
    data: [
      {
        id: "cat-1",
        key: "engineering",
        labelAr: "الهندسة",
        labelEn: "Engineering",
        fields: [{ id: "f-1", key: "react", labelAr: "رياكت", labelEn: "React" }],
      },
    ],
    isLoading: false,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useAdminExperienceLevelsQuery: () => ({
    data: [
      {
        id: "level-1",
        key: "junior",
        labelAr: "مبتدئ",
        labelEn: "Junior",
        sortOrder: 10,
        active: true,
      },
    ],
    isLoading: false,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useCreateContributorFieldCategoryMutation: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useCreateContributorFieldMutation: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  useCreateExperienceLevelMutation: () => ({
    isPending: false,
    error: null,
    mutateAsync: vi.fn(),
  }),
  AdminContributorFieldsPanel: () => (
    <div data-testid="contributor-fields-panel">Contributor Fields Panel</div>
  ),
  AdminExperienceLevelsPanel: () => (
    <div data-testid="experience-levels-panel">Experience Levels Panel</div>
  ),
}));

vi.mock("@/modules/projects", () => ({
  useAdminPublishedProjectOwnersQuery: () => ({
    data: [
      {
        ownerId: "owner-1",
        ownerName: "Dev Org",
        ownerEmail: "dev@org.com",
        publishedProjectsCount: 3,
        latestProject: { id: "p-1", title: "Project Alpha", githubRepoUrl: "https://github.com/org/alpha" },
        latestPublishedAt: "2026-08-20T12:00:00Z",
      },
    ],
    isLoading: false,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  AdminPublishedProjectOwnersPanel: () => (
    <div data-testid="published-project-owners-panel">Published Project Owners Panel</div>
  ),
}));

describe("Admin Dashboard Redesign", () => {
  it("renders AdminDashboardHero with KPI metrics", () => {
    const html = renderToStaticMarkup(
      <AdminDashboardHero
        metrics={mockMetrics}
        onSelectTab={vi.fn()}
        onOpenQuickCreate={vi.fn()}
      />,
    );

    // Matches either Arabic or English title
    expect(html).toMatch(/Admin Command Center|مركز قيادة الإدارة/);
    expect(html).toContain("2"); // pending verifications
    expect(html).toContain("3"); // pending skills
    expect(html).toContain("12"); // total fields
    expect(html).toContain("5"); // total levels
    expect(html).toContain("8"); // published owners
  });

  it("renders AdminQuickCreateDialog with tabs for category, field, and level", () => {
    const html = renderToStaticMarkup(
      <AdminQuickCreateDialog
        open={true}
        onOpenChange={vi.fn()}
        initialTab="category"
      />,
    );

    expect(html).toMatch(/Quick Create|إضافة سريعة/);
    expect(html).toMatch(/Category|تصنيف/);
    expect(html).toMatch(/Field|مجال تخصص/);
    expect(html).toMatch(/Experience Level|مستوى خبرة/);
  });

  it("renders AdminOverviewTab with urgency alerts and shortcuts", () => {
    const html = renderToStaticMarkup(
      <AdminOverviewTab
        metrics={mockMetrics}
        pendingVerifications={mockPendingVerifications}
        onSelectTab={vi.fn()}
        onOpenQuickCreate={vi.fn()}
      />,
    );

    expect(html).toMatch(/Action Required|مهام تتطلب اتخاذ إجراء/);
    expect(html).toMatch(/Quick Shortcuts|روابط سريعة/);
    expect(html).toContain("Ahmed Ali");
    expect(html).toContain('data-testid="skill-review-summary"');
    expect(html).toContain('data-testid="published-project-owners-panel"');
  });

  it("renders AdminDashboardView and mounts overview tab by default", () => {
    const html = renderToStaticMarkup(
      <AdminDashboardView initialTab="overview" />,
    );

    expect(html).toMatch(/Admin Command Center|مركز قيادة الإدارة/);
    expect(html).toMatch(/Action Required|مهام تتطلب اتخاذ إجراء/);
    expect(html).toContain('data-testid="skill-review-summary"');
  });
});

