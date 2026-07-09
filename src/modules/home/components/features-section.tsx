import {
  BadgeCheck,
  Compass,
  Route,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import {
  CardHoverEffect
  
} from "@/shared/components/ui/aceternity/card-hover-effect";
import type {HoverEffectItem} from "@/shared/components/ui/aceternity/card-hover-effect";

const FEATURES: HoverEffectItem[] = [
  {
    icon: ShieldCheck,
    title: "بوابة التحقق الذكية",
    description:
      "يفحص الذكاء الاصطناعي كل طلب مساهمة قبل وصوله لصاحب المشروع، فلا تصل إلا الطلبات المؤهّلة فعلًا مع درجة ثقة ومبرّر واضح.",
  },
  {
    icon: BadgeCheck,
    title: "ملف مهارات موثّق",
    description:
      "مهاراتك تُستخرج من مستودعاتك ونشاطك على GitHub بمستويات مبتدئ ومتوسط ومتقدم، ويعتمدها مشرف قبل استخدامها في الأهلية.",
  },
  {
    icon: Compass,
    title: "اكتشاف دلالي للمشاريع",
    description:
      "تصفية بالتقنية والتصنيف والصعوبة، مع بحث دلالي يقترح مشاريع مناسبة حتى بدون تطابق حرفي للكلمات.",
  },
  {
    icon: Users,
    title: "مطابقة المساهمين",
    description:
      "يرشّح الذكاء الاصطناعي لأصحاب المشاريع أفضل المساهمين لكل مهمة بناءً على الكفاءة الفعلية لا المهارات المعلنة.",
  },
  {
    icon: Route,
    title: "إرشاد فجوة المهارات",
    description:
      "عند رفض طلبك تحصل — في الخطة الذهبية — على خطة تطوير: المهارات الناقصة، مصادر تعلّم، ومشاريع تدريبية مقترحة.",
  },
  {
    icon: Star,
    title: "سمعة شفّافة",
    description:
      "ملف عام يعرض تقييمك ونسبة نجاحك وعدد مساهماتك المعتمدة وأبرز مهاراتك الموثّقة — سمعة مبنية على إنجاز حقيقي.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-footer-bg py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-medium tracking-wide text-primary">
            المزايا
          </span>
          <h2 className="max-w-xl text-3xl font-bold text-foreground">
            الذكاء الاصطناعي هنا يعمل، لا يزيّن
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            كل ميزة أدناه جزء من دورة المساهمة نفسها: من بناء الملف، إلى فحص
            الطلب، إلى اعتماد التسليم.
          </p>
        </div>
        <CardHoverEffect items={FEATURES} />
      </div>
    </section>
  );
}
