import type {
  ExploreProjectDto,
  ExploreResultDto,
  ExploreSearchParamsDto,
} from "../types/explore.types";

/**
 * MOCK SERVICE — no discovery endpoint exists in the backend yet.
 * Filtering/sorting runs locally to mimic `GET /projects/explore` so the URL
 * params contract (WF-03: all filters in search params) can be exercised
 * end-to-end. Replace the body with an axios call when the endpoint lands.
 */

const MOCK_PROJECTS: ExploreProjectDto[] = [
  {
    id: "p1",
    slug: "sharek-backend",
    name: "sharek-backend",
    description:
      "واجهة NestJS الخلفية لمنصة «شارك» — المصادقة والمطابقة وسير عمل التسليم.",
    category: "web",
    difficulty: "intermediate",
    languages: [
      { name: "TypeScript", percent: 78 },
      { name: "JavaScript", percent: 13 },
    ],
    technologies: ["TypeScript", "NestJS", "PostgreSQL", "Docker"],
    stars: 214,
    commitsThisMonth: 46,
    updatedAgoLabel: "منذ يومين",
    openTasksCount: 3,
    ownerUsername: "karim",
    fitHint: {
      bucket: "strong",
      matchedCount: 2,
      requiredCount: 3,
      reason: "أدلة قوية على TypeScript وNode.js الموثقتين — Docker غير موثقة بعد",
    },
  },
  {
    id: "p2",
    slug: "masar-transit",
    name: "masar-transit",
    description:
      "خرائط ومواعيد مواصلات عامة تعمل دون اتصال للقاهرة والإسكندرية، مبنية بـ React Native.",
    category: "mobile",
    difficulty: "intermediate",
    languages: [
      { name: "TypeScript", percent: 64 },
      { name: "Java", percent: 22 },
    ],
    technologies: ["React Native", "TypeScript", "SQLite"],
    stars: 342,
    commitsThisMonth: 28,
    updatedAgoLabel: "منذ يوم",
    openTasksCount: 4,
    ownerUsername: "laila-io",
    fitHint: {
      bucket: "strong",
      matchedCount: 3,
      requiredCount: 3,
      reason: "أدلة قوية على React وTypeScript الموثقتين من 3 مستودعات",
    },
  },
  {
    id: "p3",
    slug: "hisab-ledger",
    name: "hisab-ledger",
    description:
      "محرك محاسبة بالقيد المزدوج ولوحة تحكم للجمعيات التعاونية الصغيرة — React وNode.js.",
    category: "web",
    difficulty: "intermediate",
    languages: [
      { name: "JavaScript", percent: 71 },
      { name: "TypeScript", percent: 18 },
    ],
    technologies: ["React", "Node.js", "MongoDB"],
    stars: 128,
    commitsThisMonth: 33,
    updatedAgoLabel: "اليوم",
    openTasksCount: 5,
    ownerUsername: "youssef-a",
    fitHint: {
      bucket: "strong",
      matchedCount: 2,
      requiredCount: 3,
      reason: "React وNode.js موثقتان — MongoDB غير موثقة بعد",
    },
  },
  {
    id: "p4",
    slug: "taqrir-cli",
    name: "taqrir-cli",
    description:
      "توليد تقارير Markdown عربية/إنجليزية من JSON — مشروع صديق للمساهمة الأولى بمهام مبتدئة معلَّمة.",
    category: "tools_utilities",
    difficulty: "beginner",
    languages: [{ name: "Go", percent: 88 }],
    technologies: ["Go", "Cobra"],
    stars: 57,
    commitsThisMonth: 9,
    updatedAgoLabel: "منذ 3 أيام",
    openTasksCount: 6,
    ownerUsername: "omar-k",
    fitHint: {
      bucket: "partial",
      matchedCount: 1,
      requiredCount: 2,
      reason: "سجل مساهمات CLI موثق — Go ليست في ملفك الموثق بعد",
    },
  },
  {
    id: "p5",
    slug: "arabic-nlp-toolkit",
    name: "arabic-nlp-toolkit",
    description:
      "تقطيع النصوص واستعادة التشكيل والتعرف على الكيانات للنص العربي — تستخدمه ثلاثة مشاريع بحثية.",
    category: "ai_ml",
    difficulty: "advanced",
    languages: [{ name: "Python", percent: 91 }],
    technologies: ["Python", "PyTorch", "FastAPI"],
    stars: 1200,
    commitsThisMonth: 12,
    updatedAgoLabel: "منذ 5 أيام",
    openTasksCount: 2,
    ownerUsername: "nour-ml",
    fitHint: {
      bucket: "low",
      matchedCount: 0,
      requiredCount: 3,
      reason: "لا توجد أدلة Python موثقة بعد — مهام هذا المشروع تتطلب Python متقدم",
    },
  },
  {
    id: "p6",
    slug: "deploy-drift",
    name: "deploy-drift",
    description:
      "يكشف انحراف البنية التحتية بين حالة Terraform والموارد الفعلية على AWS مع تقارير مجدولة.",
    category: "devops",
    difficulty: "advanced",
    languages: [
      { name: "HCL", percent: 52 },
      { name: "Go", percent: 31 },
    ],
    technologies: ["Terraform", "AWS", "Go"],
    stars: 486,
    commitsThisMonth: 17,
    updatedAgoLabel: "منذ 4 أيام",
    openTasksCount: 1,
    ownerUsername: "sara-dev",
    fitHint: {
      bucket: "unknown",
      matchedCount: 0,
      requiredCount: 0,
      reason: "لا توجد أدلة DevOps في ملفك الموثق — اربط مستودعات أكثر أو أعد التحليل",
    },
  },
];

const SORTERS: Record<
  NonNullable<ExploreSearchParamsDto["sort"]>,
  (a: ExploreProjectDto, b: ExploreProjectDto) => number
> = {
  newest: () => 0, // mock list is already newest-first
  best_fit: (a, b) => fitRank(b) - fitRank(a),
  most_active: (a, b) => b.commitsThisMonth - a.commitsThisMonth,
  open_tasks: (a, b) => b.openTasksCount - a.openTasksCount,
};

function fitRank(project: ExploreProjectDto): number {
  const bucketRank = { strong: 3, partial: 2, low: 1, unknown: 0 } as const;
  return project.fitHint === null ? 0 : bucketRank[project.fitHint.bucket];
}

export async function getExploreProjects(
  params: ExploreSearchParamsDto,
): Promise<ExploreResultDto> {
  let projects = [...MOCK_PROJECTS];

  if (params.technologies !== undefined && params.technologies.length > 0) {
    const wanted = params.technologies.map((tech) => tech.toLowerCase());
    projects = projects.filter((project) =>
      project.technologies.some((tech) => wanted.includes(tech.toLowerCase())),
    );
  }
  if (params.category !== undefined) {
    projects = projects.filter((project) => project.category === params.category);
  }
  if (params.difficulty !== undefined) {
    projects = projects.filter(
      (project) => project.difficulty === params.difficulty,
    );
  }
  if (params.q !== undefined && params.q.trim() !== "") {
    const query = params.q.trim().toLowerCase();
    projects = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(query),
        ),
    );
  }

  projects.sort(SORTERS[params.sort ?? "newest"]);

  return Promise.resolve({
    projects,
    totalCount: projects.length,
    technologyFacets: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "Go",
      "Docker",
    ],
  });
}
