import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

const PLANS = [
  {
    name: "برونزي",
    tagline: "ابدأ مجانًا وجرّب الدورة كاملة",
    contributor: "حتى طلبَي تقديم يوميًا وإشعارات أساسية",
    owner: "حتى 10 مهام شهريًا وظهور قياسي لمشروعك",
    featured: false,
  },
  {
    name: "فضي",
    tagline: "لمن يريد فرصًا أكثر وظهورًا أعلى",
    contributor: "3 طلبات يوميًا وإشعارات مطابقة لمهاراتك وعمولة أقل",
    owner: "20 مهمة شهريًا ومطابقة لأفضل 5 مساهمين وأولوية ظهور",
    featured: false,
  },
  {
    name: "ذهبي",
    tagline: "التجربة الكاملة بذكاء اصطناعي أعمق",
    contributor: "4 طلبات يوميًا وتوصيات ذكية وإرشاد فجوة المهارات وبلا عمولة",
    owner: "30 مهمة شهريًا ومطابقة لأفضل 10 مساهمين وإشعار تلقائي لأنسبهم",
    featured: true,
  },
];

export function PlansSection() {
  return (
    <section id="plans" className="scroll-mt-20 py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-medium tracking-wide text-primary">
            الخطط
          </span>
          <h2 className="max-w-lg text-3xl font-bold text-foreground">
            خطط للمساهمين ولأصحاب المشاريع
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className={cn(
                "relative flex flex-col gap-5 rounded-card border border-border bg-card p-7",
                plan.featured && "border-primary shadow-lg shadow-primary/10",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 start-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  الأكثر قيمة
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {plan.tagline}
                </p>
              </div>
              <ul className="flex flex-col gap-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-muted-foreground">
                    <b className="font-semibold text-foreground">للمساهم:</b>{" "}
                    {plan.contributor}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-indigo/15 text-brand-indigo">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-muted-foreground">
                    <b className="font-semibold text-foreground">
                      لصاحب المشروع:
                    </b>{" "}
                    {plan.owner}
                  </span>
                </li>
              </ul>
              <Button
                asChild
                variant={plan.featured ? "primary" : "outline"}
                size="sm"
                className="mt-auto"
              >
                <Link to={ROUTES.register}>ابدأ بخطة {plan.name}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
