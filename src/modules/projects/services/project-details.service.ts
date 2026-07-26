import type {
  MockProjectDto,
  ProjectDetailsDto,
  ProjectTaskSummaryDto,
} from "../types/project-details.types";

/**
 * MOCK SERVICE — no details endpoint yet; future `GET /projects/:slug`.
 * Self-contained mock list (decoupled from the live `/projects/discover`
 * feed, which has its own real shape). Unknown slug rejects with
 * { code: "not-found" }.
 */

const MOCK_PROJECTS: MockProjectDto[] = [
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

const README_DIGESTS: Record<string, string> = {
  "sharek-backend":
    "واجهة برمجية مبنية بمعمارية modular monolith: وحدات للهوية والمشاريع وطلبات المساهمة والسمعة، مع تكامل GitHub وطبقة ذكاء اصطناعي منفصلة. المساهمة تبدأ من المهام المفتوحة أدناه — كل مهمة تحدد تقنياتها المطلوبة بوضوح.",
  "masar-transit":
    "تطبيق React Native يعمل دون اتصال: خرائط المسارات، مواعيد تقديرية، وتنبيهات الازدحام للقاهرة والإسكندرية. نرحب بمساهمات تحسين الأداء وتغطية الاختبارات ودعم مدن جديدة.",
  "hisab-ledger":
    "محرك قيد مزدوج مفتوح المصدر للجمعيات التعاونية: دفتر أستاذ، تقارير شهرية، وصلاحيات متعددة المستويات. الكود الأمامي React والخلفي Node.js — المهام المفتوحة تركز على لوحة التقارير.",
  "taqrir-cli":
    "أداة سطر أوامر بلغة Go لتوليد تقارير Markdown ثنائية اللغة من ملفات JSON. مشروع صديق للمساهمين الجدد: مهام صغيرة معلَّمة بوضوح ومراجعات سريعة.",
  "arabic-nlp-toolkit":
    "مكتبة Python لمعالجة العربية: تقطيع، استعادة تشكيل، وتعرف على الكيانات. تُستخدم في ثلاثة مشاريع بحثية منشورة — المساهمة تتطلب خلفية قوية في PyTorch.",
  "deploy-drift":
    "يقارن حالة Terraform بالموارد الفعلية على AWS ويرسل تقارير انحراف مجدولة. مكتوب بـ Go وHCL — المهمة المفتوحة الحالية حول دعم مناطق AWS إضافية.",
};

const OWNER_NAMES: Record<string, string> = {
  "sharek-backend": "كريم محمد",
  "masar-transit": "ليلى إبراهيم",
  "hisab-ledger": "يوسف عادل",
  "taqrir-cli": "عمر خالد",
  "arabic-nlp-toolkit": "نور مصطفى",
  "deploy-drift": "سارة أحمد",
};

const OPEN_TASKS: Record<string, ProjectTaskSummaryDto[]> = {
  "sharek-backend": [
    {
      id: "t-jwt",
      title: "إضافة مصادقة JWT لتحديث الرموز",
      requiredTechnologies: ["Node.js", "JWT", "REST APIs"],
      difficulty: "intermediate",
      deadlineLabel: "خلال 14 يومًا",
      rewardLabel: null,
      fitHint: {
        bucket: "partial",
        matchedCount: 2,
        requiredCount: 3,
        reason: "Node.js وREST موثقتان — لا توجد أدلة JWT بعد",
      },
    },
    {
      id: "t-notify",
      title: "بناء لوحة إشعارات فورية",
      requiredTechnologies: ["React", "Node.js", "WebSocket"],
      difficulty: "intermediate",
      deadlineLabel: "خلال 21 يومًا",
      rewardLabel: "$120",
      fitHint: {
        bucket: "strong",
        matchedCount: 3,
        requiredCount: 3,
        reason: "كل التقنيات المطلوبة موثقة في ملفك",
      },
    },
    {
      id: "t-docs",
      title: "توثيق واجهات REST بالعربية",
      requiredTechnologies: ["REST APIs", "Markdown"],
      difficulty: "beginner",
      deadlineLabel: null,
      rewardLabel: null,
      fitHint: {
        bucket: "strong",
        matchedCount: 2,
        requiredCount: 2,
        reason: "توثيق سابق موثق في سجل مساهماتك",
      },
    },
  ],
  "masar-transit": [
    {
      id: "t-perf",
      title: "تحسين أداء قوائم المهام الطويلة",
      requiredTechnologies: ["React", "TypeScript", "SQLite"],
      difficulty: "intermediate",
      deadlineLabel: "خلال 10 أيام",
      rewardLabel: null,
      fitHint: {
        bucket: "partial",
        matchedCount: 2,
        requiredCount: 3,
        reason: "React وTypeScript موثقتان — SQLite غير موثقة",
      },
    },
  ],
};

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetailsDto> {
  const base = MOCK_PROJECTS.find((project) => project.slug === slug);
  if (base === undefined) {
    return Promise.reject({ code: "not-found" });
  }
  return {
    ...base,
    readmeDigest: README_DIGESTS[slug] ?? base.description,
    ownerDisplayName: OWNER_NAMES[slug] ?? base.ownerUsername,
    archived: slug === "deploy-drift", // exercises the archived banner
    openTasks: OPEN_TASKS[slug] ?? [],
  };
}
