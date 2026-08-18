// @vitest-environment happy-dom

import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUserDto } from "@/modules/auth";
import type { ContributorProfileDto } from "@/modules/contributors";
import { PersonalInformationSettingsPage } from "./personal-information-settings-page";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mockUser: AuthUserDto = {
  id: "user-1",
  email: "karim@example.com",
  username: "karimmohamed",
  firstName: "Karim",
  lastName: "Mohamed",
  avatarUrl: "https://example.com/avatar.jpg",
  role: "contributor",
  status: "active",
  preferredLanguage: "ar",
  createdAt: "2026-08-09T00:00:00.000Z",
  updatedAt: "2026-08-09T00:00:00.000Z",
  lastLoginAt: null,
};

const mockProfile: ContributorProfileDto = {
  username: "karimmohamed",
  displayName: "Karim Mohamed",
  avatarUrl: "https://example.com/avatar.jpg",
  roleLabel: "Senior Contributor",
  bio: "Full stack developer",
  skills: [],
  availability: "Available for open source projects",
  githubStatus: {
    connected: true,
    username: "karimmohamed",
  },
  githubInstallations: [],
  reputationSummary: {
    rating: 4.9,
    reviewsCount: 12,
    completedContributions: 24,
    totalAssignedTasks: 25,
    successRate: 96,
    topVerifiedSkills: [],
  },
  contributionHistory: [],
  completionPrompts: [],
  viewerRelationship: "owner",
  experienceLevel: {
    id: "senior",
    key: "senior",
    labelAr: "متقدم",
    labelEn: "Senior",
  },
  fields: [],
  declaredSkills: ["React", "TypeScript"],
};

describe("PersonalInformationSettingsPage", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it("renders the settings header, domain tabs, and sub-nav groups", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={mockUser}
            profile={mockProfile}
          />
        </QueryClientProvider>,
      );
    });

    expect(container.textContent).toContain("الإعدادات");
    expect(container.textContent).toContain("نوع الحساب والتخصص");
  });

  it("switches to the personal details sub-tab when clicked", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={mockUser}
            profile={mockProfile}
          />
        </QueryClientProvider>,
      );
    });

    const personalNavBtn = [...container.querySelectorAll("button")].find(
      (b) => b.textContent.includes("تعديل المعلومات الشخصية"),
    );
    if (!personalNavBtn) throw new Error("Expected personal nav button");

    await act(async () => {
      personalNavBtn.click();
    });

    expect(container.textContent).toContain("المعلومات الشخصية");
    expect(container.textContent).toContain("الاسم الأول");
    expect(container.textContent).toContain("الاسم الأخير");
  });

  it("switches to the password sub-tab and shows requirements checklist", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={mockUser}
            profile={mockProfile}
          />
        </QueryClientProvider>,
      );
    });

    const passwordNavBtn = [...container.querySelectorAll("button")].find((b) =>
      b.textContent.includes("تغيير كلمة المرور"),
    );
    if (!passwordNavBtn) throw new Error("Expected password nav button");

    await act(async () => {
      passwordNavBtn.click();
    });

    expect(container.textContent).toContain("تغيير كلمة المرور");
    expect(container.textContent).toContain("متطلبات كلمة المرور:");
  });

  it("calls onNavigateToSection when notifications nav item is clicked", async () => {
    const handleNavigate = vi.fn();
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={mockUser}
            profile={mockProfile}
            onNavigateToSection={handleNavigate}
          />
        </QueryClientProvider>,
      );
    });

    const notificationsNavBtn = [
      ...container.querySelectorAll("button"),
    ].find((b) => b.textContent.includes("الإشعارات"));
    if (!notificationsNavBtn) throw new Error("Expected notifications nav button");

    await act(async () => {
      notificationsNavBtn.click();
    });

    expect(handleNavigate).toHaveBeenCalledWith("notifications");
  });

  it("switches to the phone sub-tab and renders the phone settings form", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={{ ...mockUser, phoneNumber: "+201012345678", phoneVerifiedAt: "2026-08-09T00:00:00.000Z" }}
            profile={mockProfile}
          />
        </QueryClientProvider>,
      );
    });

    const phoneNavBtn = [
      ...container.querySelectorAll("button"),
    ].find((b) => b.textContent.includes("الهاتف") || b.textContent.includes("phone"));
    if (!phoneNavBtn) throw new Error("Expected phone nav button");

    await act(async () => {
      phoneNavBtn.click();
    });

    expect(container.textContent).toContain("+201012345678");
    expect(container.querySelector("#phone-number")).not.toBeNull();
  });

  it("renders non-profile sections in the unified layout with corresponding slot", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalInformationSettingsPage
            user={mockUser}
            profile={mockProfile}
            activeSectionId="language"
            languageSlot={<div data-testid="language-content">Language Settings Content</div>}
          />
        </QueryClientProvider>,
      );
    });

    expect(container.textContent).toContain("الإعدادات");
    expect(container.querySelector('[data-testid="language-content"]')).not.toBeNull();
    expect(container.textContent).toContain("Language Settings Content");
  });
});
