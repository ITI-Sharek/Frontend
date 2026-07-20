import { lazy, Suspense } from "react";
import { ArrowLeft, CheckCircle2, FileCheck2, UsersRound } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

const ContributionStoryPlayer = lazy(
  () => import("./contribution-story-player"),
);

const PRINCIPLES = [
  { icon: FileCheck2, label: "التقدم يُقاس بمساهمة مكتملة" },
  { icon: UsersRound, label: "القرار النهائي يبقى للبشر" },
  { icon: CheckCircle2, label: "كل ادعاء مهم يعود إلى دليل" },
] as const;

export function HeroSection() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
          <div className="flex max-w-2xl flex-col items-start gap-6">
            <p className="border-b border-current/30 pb-2 text-sm font-semibold">
              مساحة تعاون تحفظ أثر العمل الحقيقي
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              ساهم في عملٍ حقيقي. وابنِ سجلاً يمكن التحقق منه.
            </h1>
            <p className="max-w-[65ch] text-base leading-8 opacity-85 sm:text-lg">
              ينظّم Sharek التعاون بين أصحاب المشاريع والمساهمين من اكتشاف
              العمل المناسب حتى اكتماله ومراجعته. النتيجة ليست عدداً من
              الطلبات أو الشارات، بل مساهمة موثقة تشرح ما أُنجز ومن راجعه وما
              الدليل عليه.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="default"
                className="min-h-12 bg-white px-6 text-primary shadow-none hover:bg-white/90 focus-visible:ring-white"
              >
                <Link to={ROUTES.register}>
                  ابدأ كمساهم
                  <ArrowLeft className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="default"
                className="min-h-12 border-current/45 bg-transparent px-6 text-current hover:bg-white/10"
              >
                <Link to={ROUTES.register}>أضف مشروعك</Link>
              </Button>
            </div>

            <p className="text-sm opacity-80">
              لديك حساب؟{" "}
              <Link
                to={ROUTES.login}
                className="font-semibold underline underline-offset-4 focus-visible:rounded-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className="min-w-0" aria-label="قصة مساهمة توضيحية">
            <div className="sm:hidden">
              <ContributionStoryFallback />
            </div>
            <div className="hidden sm:block">
              <Suspense fallback={<ContributionStoryFallback />}>
                <ContributionStoryPlayer />
              </Suspense>
            </div>
            <details className="mt-3 border-t border-current/30 pt-3 text-sm opacity-85">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold focus-visible:rounded-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
                وصف المشهد المتحرك
              </summary>
              <p className="max-w-[70ch] pb-2 leading-7">
                يبدأ بفهم ملاءمة المساهم والمتطلبات، ثم قرار صاحب المشروع،
                وتسليم العمل، ومراجعة الأدلة، وينتهي بسجل مساهمة متحقق منه.
                التحليل الآلي استشاري، والقرار والمراجعة للبشر.
              </p>
            </details>
          </div>
        </div>

        <ul className="mt-12 grid border-y border-current/25 sm:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <li
              key={principle.label}
              className="flex min-h-20 items-center gap-3 border-current/25 px-1 py-4 sm:border-s sm:px-5 sm:first:border-s-0"
            >
              <principle.icon className="size-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium leading-6">
                {principle.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ContributionStoryFallback() {
  return (
    <div className="aspect-[16/11] rounded-card border border-white/30 bg-white p-6 text-slate-900 sm:p-8">
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            سجل مساهمة · نموذج توضيحي
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            تحسين التنقل بلوحة المفاتيح في الواجهة العربية
          </h2>
        </div>
        <div className="space-y-3 text-sm">
          <p>قرار المالك: تم القبول بقرار بشري</p>
          <p>الدليل: طلب دمج + وصف العمل + مراجعة المالك</p>
          <p className="font-semibold text-emerald-600">مساهمة متحقق منها</p>
        </div>
      </div>
    </div>
  );
}
