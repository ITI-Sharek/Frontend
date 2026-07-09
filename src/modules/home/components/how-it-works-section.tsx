import { motion } from "framer-motion";
import { Github, GitPullRequest, ScanSearch } from "lucide-react";

const STEPS = [
  {
    icon: Github,
    title: "اربط حساب GitHub",
    description:
      "سجّل واربط حسابك؛ تجلب المنصّة مستودعاتك ولغاتك ونشاطك الفعلي كدليل على مهاراتك.",
  },
  {
    icon: ScanSearch,
    title: "الذكاء الاصطناعي يبني ملف مهاراتك",
    description:
      "يحلّل وكيل الذكاء الاصطناعي الأدلة وينشئ ملفًا موثّقًا بمستويات واضحة، يراجعه مشرف قبل اعتماده.",
  },
  {
    icon: GitPullRequest,
    title: "ساهم وابنِ سمعتك",
    description:
      "قدّم على مهام تناسب مستواك، سلّم عبر Pull Request، واحصل على تقييم يرفع سمعتك الموثّقة.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-medium tracking-wide text-primary">
            كيف تعمل المنصّة؟
          </span>
          <h2 className="max-w-lg text-3xl font-bold text-foreground">
            ثلاث خطوات من التسجيل إلى أول مساهمة معتمدة
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative flex flex-col gap-4 rounded-card border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-indigo/10 text-brand-indigo">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  className="font-wordmark text-3xl font-bold text-border"
                  dir="ltr"
                  aria-hidden="true"
                >
                  0{idx + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
