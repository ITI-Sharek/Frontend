import type {
  TaskCardDto,
  TaskDetailsDto,
  TaskFeedFiltersDto,
  ValidationResultDto,
} from "../types/task.types";

/**
 * MOCK SERVICE — no tasks endpoints yet. Validation outcomes are
 * deterministic per task id so all three WF-06/12 screens are demoable:
 * t-notify → eligible · t-jwt → ineligible · t-perf → review_needed.
 */

const MOCK_TASKS: TaskCardDto[] = [
  {
    id: "t-notify",
    title: "بناء لوحة إشعارات فورية",
    projectName: "sharek-backend",
    projectSlug: "sharek-backend",
    requiredTechnologies: ["React", "Node.js", "WebSocket"],
    difficulty: "intermediate",
    deadlineLabel: "خلال 21 يومًا",
    rewardLabel: "$120",
    applicantsLabel: "3 متقدمين حتى الآن",
    fitHint: {
      bucket: "strong",
      matchedCount: 3,
      requiredCount: 3,
      reason: "كل التقنيات المطلوبة موثقة في ملفك",
    },
  },
  {
    id: "t-jwt",
    title: "إضافة مصادقة JWT لتحديث الرموز",
    projectName: "sharek-backend",
    projectSlug: "sharek-backend",
    requiredTechnologies: ["Node.js", "JWT", "REST APIs"],
    difficulty: "intermediate",
    deadlineLabel: "خلال 14 يومًا",
    rewardLabel: null,
    applicantsLabel: "5 متقدمين حتى الآن",
    fitHint: {
      bucket: "partial",
      matchedCount: 2,
      requiredCount: 3,
      reason: "Node.js وREST موثقتان — لا توجد أدلة JWT بعد",
    },
  },
  {
    id: "t-perf",
    title: "تحسين أداء قوائم المهام الطويلة",
    projectName: "masar-transit",
    projectSlug: "masar-transit",
    requiredTechnologies: ["React", "TypeScript", "SQLite"],
    difficulty: "intermediate",
    deadlineLabel: "خلال 10 أيام",
    rewardLabel: null,
    applicantsLabel: "متقدم واحد حتى الآن",
    fitHint: {
      bucket: "partial",
      matchedCount: 2,
      requiredCount: 3,
      reason: "React وTypeScript موثقتان — SQLite غير موثقة",
    },
  },
  {
    id: "t-docs",
    title: "توثيق واجهات REST بالعربية",
    projectName: "sharek-backend",
    projectSlug: "sharek-backend",
    requiredTechnologies: ["REST APIs", "Markdown"],
    difficulty: "beginner",
    deadlineLabel: null,
    rewardLabel: null,
    applicantsLabel: "لا متقدمين بعد",
    fitHint: {
      bucket: "strong",
      matchedCount: 2,
      requiredCount: 2,
      reason: "توثيق سابق موثق في سجل مساهماتك",
    },
  },
  {
    id: "t-reports",
    title: "لوحة تقارير شهرية تفاعلية",
    projectName: "hisab-ledger",
    projectSlug: "hisab-ledger",
    requiredTechnologies: ["React", "Node.js", "MongoDB"],
    difficulty: "advanced",
    deadlineLabel: "خلال 30 يومًا",
    rewardLabel: "$200",
    applicantsLabel: "متقدمان حتى الآن",
    fitHint: {
      bucket: "partial",
      matchedCount: 2,
      requiredCount: 3,
      reason: "React وNode.js موثقتان — MongoDB غير موثقة",
    },
  },
  {
    id: "t-starter",
    title: "إضافة قالب تقرير أسبوعي جديد",
    projectName: "taqrir-cli",
    projectSlug: "taqrir-cli",
    requiredTechnologies: ["Go"],
    difficulty: "beginner",
    deadlineLabel: null,
    rewardLabel: null,
    applicantsLabel: "لا متقدمين بعد",
    fitHint: {
      bucket: "low",
      matchedCount: 0,
      requiredCount: 1,
      reason: "Go ليست في ملفك الموثق — مهمة مبتدئة تقبل مهارات مجاورة",
    },
  },
];

const TASK_DESCRIPTIONS: Record<string, string> = {
  "t-notify":
    "نحتاج لوحة إشعارات فورية داخل التطبيق: قائمة بالإشعارات غير المقروءة، عدّاد في الشريط العلوي، وتحديث لحظي عبر WebSocket عند وصول إشعار جديد. الواجهة موجودة كتصميم — المطلوب البناء والربط مع القناة الخلفية الجاهزة.",
  "t-jwt":
    "تنفيذ تدفق تحديث الرموز: access token قصير العمر في الذاكرة وrefresh token في httpOnly cookie، مع معالجة 401 وإعادة المحاولة. البنية موثقة في docs/ARCHITECTURE.md — المطلوب التنفيذ والاختبارات.",
  "t-perf":
    "قوائم المهام تتباطأ بعد ٢٠٠ عنصر على الأجهزة الضعيفة. المطلوب: قياس، ثم virtualization أو pagination محلية، مع الحفاظ على سلوك RTL والوصولية.",
  "t-docs":
    "توثيق نقاط REST الرئيسية بالعربية مع أمثلة طلب/استجابة. البنية جاهزة في docs/API.md — المطلوب استكمال الأقسام الناقصة بنفس الأسلوب.",
  "t-reports":
    "لوحة تقارير شهرية: رسوم بيانية للإيرادات والمصروفات، تصدير CSV، وفلاتر زمنية. تُبنى فوق واجهة التقارير الحالية.",
  "t-starter":
    "إضافة قالب تقرير أسبوعي إلى مكتبة القوالب مع اختبار واحد على الأقل. مهمة أولى مثالية — الإرشادات في CONTRIBUTING.md.",
};

/** Requirements vs. the mock verified profile (React/TS/Node/REST/توثيق). */
const VERIFIED_SKILLS: Record<string, string> = {
  React: "متقدم",
  TypeScript: "متوسط",
  "Node.js": "متوسط",
  "REST APIs": "متوسط",
  Markdown: "متوسط",
};

export async function getTasks(
  filters: TaskFeedFiltersDto,
): Promise<{ tasks: TaskCardDto[]; totalCount: number; technologyFacets: string[] }> {
  let tasks = [...MOCK_TASKS];
  if (filters.technologies !== undefined && filters.technologies.length > 0) {
    const wanted = filters.technologies.map((t) => t.toLowerCase());
    tasks = tasks.filter((task) =>
      task.requiredTechnologies.some((tech) =>
        wanted.includes(tech.toLowerCase()),
      ),
    );
  }
  if (filters.difficulty !== undefined) {
    tasks = tasks.filter((task) => task.difficulty === filters.difficulty);
  }
  if (filters.hasReward === true) {
    tasks = tasks.filter((task) => task.rewardLabel !== null);
  }
  if (filters.q !== undefined && filters.q.trim() !== "") {
    const query = filters.q.trim().toLowerCase();
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.projectName.toLowerCase().includes(query) ||
        task.requiredTechnologies.some((tech) =>
          tech.toLowerCase().includes(query),
        ),
    );
  }
  return Promise.resolve({
    tasks,
    totalCount: tasks.length,
    technologyFacets: ["React", "TypeScript", "Node.js", "Go", "MongoDB", "WebSocket"],
  });
}

export async function getTaskDetails(taskId: string): Promise<TaskDetailsDto> {
  const base = MOCK_TASKS.find((task) => task.id === taskId);
  if (base === undefined) return Promise.reject({ code: "not-found" });
  return Promise.resolve({
    ...base,
    description: TASK_DESCRIPTIONS[taskId] ?? base.title,
    maxApplicants: 10,
    requirements: base.requiredTechnologies.map((technology) => ({
      technology,
      verified: technology in VERIFIED_SKILLS,
      proficiencyLabel: VERIFIED_SKILLS[technology] ?? null,
    })),
    applicationState: "open",
    quota: { used: 1, dailyLimit: 2 },
  });
}

const VALIDATION_OUTCOMES: Record<string, ValidationResultDto["decision"]> = {
  "t-notify": "eligible",
  "t-jwt": "ineligible",
  "t-perf": "review_needed",
};

export async function submitApplication(
  taskId: string,
  _coverMessage: string,
): Promise<ValidationResultDto> {
  const decision = VALIDATION_OUTCOMES[taskId] ?? "eligible";
  const result: ValidationResultDto = {
    decision,
    confidenceBand: decision === "review_needed" ? "low" : "high",
    justification:
      decision === "eligible"
        ? "ملفك الموثق يُظهر React متقدمًا وNode.js متوسطًا من ٣ مستودعات، مع خبرة WebSocket في مشروع dashboard-ui."
        : decision === "ineligible"
          ? "تتطلب المهمة JWT بمستوى متوسط — لا توجد أدلة مصادقة في ملفك الموثق. Node.js وREST APIs مطابقتان."
          : "الثقة في تقييم SQLite منخفضة — سيراجع فريق المنصة طلبك يدويًا.",
    matched:
      decision === "ineligible" ? ["Node.js", "REST APIs"] : ["React", "Node.js", "WebSocket"],
    missing: decision === "ineligible" ? ["JWT"] : [],
    evidenceRefs: ["repo: dashboard-ui (34 commit)", "repo: api-server (REST)"],
    alternatives:
      decision === "ineligible"
        ? MOCK_TASKS.filter((task) => task.fitHint?.bucket === "strong")
        : [],
  };
  // Simulate the AI validation window so the قيد التحقق state is visible.
  return new Promise((resolve) => setTimeout(() => resolve(result), 1600));
}
