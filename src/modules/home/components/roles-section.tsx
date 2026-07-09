import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

const ROLES = [
  {
    eyebrow: "للمساهم",
    title: "حوّل نشاطك على GitHub إلى سمعة مهنية",
    bullets: [
      "ملف مهارات موثّق يُبنى تلقائيًا من مستودعاتك",
      "توصيات مهام تناسب مستواك الفعلي",
      "تسليم عبر Pull Request وتقييم يوثّق إنجازك",
      "مكافآت اختيارية على بعض المهام",
    ],
    cta: "أنشئ ملفك المهني",
    slideFrom: 40,
  },
  {
    eyebrow: "لصاحب المشروع",
    title: "استقبل مساهمين مؤهّلين، لا طلبات عشوائية",
    bullets: [
      "انشر مشروعك برابط مستودع GitHub وسنجلب بياناته",
      "أنشئ مهام مساهمة بمتطلبات وصعوبة وموعد واضح",
      "تصلك فقط الطلبات التي اجتازت التحقق الذكي",
      "مطابقة تلقائية مع أفضل المساهمين في الخطط الأعلى",
    ],
    cta: "انشر مشروعك",
    slideFrom: -40,
  },
] as const;

export function RolesSection() {
  return (
    <section id="roles" className="scroll-mt-20 py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
        {ROLES.map((role) => (
          <motion.div
            key={role.eyebrow}
            initial={{ opacity: 0, x: role.slideFrom }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 rounded-card border border-border bg-card p-8"
          >
            <span className="text-[13px] font-medium tracking-wide text-primary">
              {role.eyebrow}
            </span>
            <h3 className="text-2xl font-bold text-foreground">{role.title}</h3>
            <ul className="flex flex-col gap-3">
              {role.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-muted-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" className="mt-2 self-start px-8">
              <Link to={ROUTES.register}>{role.cta}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
