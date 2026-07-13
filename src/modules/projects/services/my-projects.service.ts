import type {
  ImportDraftDto,
  MyProjectDto,
  OwnerQuotaDto,
  RepoPickDto,
} from "../types/my-projects.types";

/**
 * MOCK SERVICE — owner portfolio + import flow. The repo list mirrors the
 * shape of the real GET /github/repositories; import failures are keyed by
 * repo name so every OJ-1 error state is demoable:
 * "sara-dev/private-notes" → private · "missing/repo" → not_found ·
 * "sara-dev/hisab-ledger" → duplicate.
 */

const MOCK_MY_PROJECTS: MyProjectDto[] = [
  {
    id: "mp1",
    title: "hisab-ledger",
    slug: "hisab-ledger",
    status: "published",
    openRequestsCount: 3,
    pendingApplicationsCount: 4,
    lastActivityLabel: "اليوم",
  },
  {
    id: "mp2",
    title: "masar-transit",
    slug: "masar-transit",
    status: "draft",
    openRequestsCount: 0,
    pendingApplicationsCount: 0,
    lastActivityLabel: "منذ 3 أيام",
  },
];

const MOCK_REPOS: RepoPickDto[] = [
  { fullName: "sara-dev/qamar-ui", description: "مكتبة مكونات React عربية RTL", language: "TypeScript", stars: 88, isPrivate: false },
  { fullName: "sara-dev/hisab-ledger", description: "محرك محاسبة بالقيد المزدوج", language: "JavaScript", stars: 128, isPrivate: false },
  { fullName: "sara-dev/wasl-api", description: "بوابة API للربط بين الخدمات", language: "Go", stars: 41, isPrivate: false },
  { fullName: "sara-dev/private-notes", description: "ملاحظات شخصية", language: "TypeScript", stars: 0, isPrivate: true },
  { fullName: "sara-dev/tajruba-e2e", description: "إطار اختبارات E2E بالعربية", language: "TypeScript", stars: 15, isPrivate: false },
];

export async function getMyProjects(): Promise<{
  projects: MyProjectDto[];
  quota: OwnerQuotaDto;
}> {
  return Promise.resolve({
    projects: MOCK_MY_PROJECTS,
    quota: { used: 14, monthlyLimit: 20 },
  });
}

export async function getOwnerRepos(): Promise<RepoPickDto[]> {
  return Promise.resolve(MOCK_REPOS);
}

export async function importRepoAsDraft(
  fullName: string,
): Promise<ImportDraftDto> {
  if (fullName === "missing/repo" || !fullName.includes("/")) {
    return Promise.reject({ code: "not_found" });
  }
  const repo = MOCK_REPOS.find((item) => item.fullName === fullName);
  if (repo?.isPrivate) return Promise.reject({ code: "private" });
  if (fullName === "sara-dev/hisab-ledger") {
    return Promise.reject({ code: "duplicate" });
  }
  const shortName = fullName.split("/")[1] ?? fullName;
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          title: shortName,
          description: repo?.description ?? "",
          technologies: repo?.language ? [repo.language] : [],
          category: null,
          difficulty: null,
          fetchedFields: ["title", "description", "technologies"],
        }),
      900,
    ),
  );
}
