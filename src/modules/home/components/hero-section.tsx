import { motion } from "framer-motion";
import { BadgeCheck, GitPullRequest, Sparkles, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Spotlight } from "@/shared/components/ui/aceternity/spotlight";
import { TextGenerateEffect } from "@/shared/components/ui/aceternity/text-generate-effect";

const HERO_STATS = [
  { value: "+90%", label: "دقة التحقق الذكي من المهارات" },
  { value: "GitHub", label: "ملفات مهارات مبنية من نشاطك الفعلي" },
  { value: "3 أدوار", label: "مساهم، صاحب مشروع، ومشرف جودة" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Aceternity grid background + radial mask */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_left,rgba(46,49,146,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,49,146,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] dark:bg-[linear-gradient(to_left,rgba(154,163,240,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(154,163,240,0.07)_1px,transparent_1px)]"
      />
      <Spotlight className="top-0 start-0" fill="var(--primary)" />
      <Spotlight
        className="top-20 start-1/2 opacity-60"
        fill="var(--brand-indigo)"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-foreground"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            منصّة تعاون مفتوحة المصدر مدعومة بالذكاء الاصطناعي
          </motion.span>

          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            <TextGenerateEffect words="ساهم في مشاريع حقيقية، وابنِ سمعة تقنية موثّقة" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            «شارك» تربط أصحاب المشاريع مفتوحة المصدر بمطوّرين تحقّق الذكاء
            الاصطناعي من مهاراتهم: يصل للمالك طلبات مؤهّلة فقط، ويحصل المساهم
            على مسار نموّ واضح وسمعة تُبنى من مساهمات معتمدة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild size="sm" className="px-8">
              <Link to={ROUTES.register}>ابدأ كمساهم</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="px-8">
              <Link to={ROUTES.register}>انشر مشروعك</Link>
            </Button>
            <Link
              to={ROUTES.login}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              لديك حساب؟ تسجيل الدخول
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-4 grid w-full grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className="font-wordmark text-2xl font-bold text-foreground"
                  dir="ltr"
                >
                  {stat.value}
                </dd>
                <dd className="text-[13px] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Floating validation-card cluster around the logo */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[420px] lg:block">
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full border-2 border-brand-indigo/15"
          />
          <div
            aria-hidden="true"
            className="absolute inset-20 rounded-full border-2 border-primary/25"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute inset-0 m-auto flex size-40 items-center justify-center rounded-[32px] border border-border bg-card shadow-xl"
          >
            <img
              src="/logo-1.png"
              alt="شعار شارك"
              width={120}
              height={70}
              className="h-16 w-auto"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute end-0 top-10 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium shadow-lg"
          >
            <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
            <span>
              اجتاز التحقق الذكي · <span dir="ltr">92%</span>
            </span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
            className="absolute bottom-16 start-0 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium shadow-lg"
          >
            <Star className="size-4 text-brand-indigo" aria-hidden="true" />
            <span>
              السمعة <span dir="ltr">4.8</span> · 18 مساهمة معتمدة
            </span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
            className="absolute bottom-2 end-10 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium shadow-lg"
          >
            <GitPullRequest className="size-4 text-primary" aria-hidden="true" />
            <span dir="ltr">Python — متقدم ✓</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
