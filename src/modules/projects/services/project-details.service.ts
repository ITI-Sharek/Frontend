import { getExploreProjects } from "./explore.service";
import type { ProjectDetailsDto, ProjectTaskSummaryDto } from "../types/project-details.types";

/**
 * MOCK SERVICE — no details endpoint yet; future `GET /projects/:slug`.
 * Reuses the explore mock list as the base and layers details on top.
 * Unknown slug rejects with { code: "not-found" }.
 */

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
  const { projects } = await getExploreProjects({});
  const base = projects.find((project) => project.slug === slug);
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
