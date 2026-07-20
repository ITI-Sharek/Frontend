import {
  ClipboardCheck,
  Compass,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";

import { JourneyPathIllustration } from "./illustrations/journey-path-illustration";

const JOURNEY = [
  {
    icon: Compass,
    title: "اكتشف عملاً مناسباً وافهم المطلوب",
    description:
      "تعرّف على المشروع، نطاق المهمة، طريقة التعاون، والأدلة المطلوبة. يعرض التقييم المساعد ما يدعم الملاءمة وما ينقصها دون أن يمنعك من التقديم.",
  },
  {
    icon: ClipboardCheck,
    title: "قدّم طلبك وتلقَّ قرار المالك",
    description:
      "يصل طلب واضح إلى صاحب المشروع مع السياق المناسب. التحليل الآلي يشرح الإشارات وعدم اليقين؛ صاحب المشروع يتخذ قرار الاختيار النهائي.",
  },
  {
    icon: MessagesSquare,
    title: "تعاون وأنجز العمل المتفق عليه",
    description:
      "بعد القبول تبدأ مساحة التعاون الخاصة بالمساهمة: مهمة محددة، نقاش مرتبط بها، حالات واضحة، وتسليم يمكن مراجعته.",
  },
  {
    icon: ShieldCheck,
    title: "قدّم الدليل وابنِ سجلاً موثوقاً",
    description:
      "تُراجع النتيجة ومصادرها ودرجة ظهورها. تتحول المساهمة المكتملة إلى سجل مهني يحفظ السياق من دون كشف معلومات المصدر الخاصة.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="journey" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              الرحلة تبدأ بالعمل المناسب، وتنتهي بأثرٍ مهني دائم.
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-8 text-muted-foreground">
              صُممت كل خطوة لخدمة المساهمة نفسها. لا توجد مسابقات شعبية، ولا
              سباق طلبات، ولا نشاط يُقاس لمجرد إبقاء الناس داخل المنصة.
            </p>
            <JourneyPathIllustration className="mt-12 hidden w-full max-w-[240px] lg:block" />
          </div>

          <ol className="border-t border-border">
            {JOURNEY.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-4 border-b border-border py-7 sm:grid-cols-[56px_1fr] sm:gap-6 sm:py-9"
              >
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span
                    className="font-mono text-sm font-semibold text-primary"
                    dir="ltr"
                  >
                    0{index + 1}
                  </span>
                  <step.icon
                    className="size-6 text-primary"
                    aria-hidden
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-8 text-foreground sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[68ch] text-sm leading-7 text-muted-foreground sm:text-base">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
