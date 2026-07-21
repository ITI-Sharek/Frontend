import { MessageCircleQuestion, ShieldCheck, Sparkles, Users } from "lucide-react";

const ABOUT_POINTS = [
  {
    icon: ShieldCheck,
    title: "دليل قبل الادعاء",
    body: "كل مساهمة موثقة تعود إلى دليل يمكن مراجعته: طلب دمج، وصف عمل، أو إفادة صاحب المشروع.",
  },
  {
    icon: Users,
    title: "القرار يبقى للبشر",
    body: "التحليل الآلي استشاري فقط. صاحب المشروع يقرر القبول، والمراجعة البشرية تؤكد النتيجة.",
  },
  {
    icon: Sparkles,
    title: "سجل مهني حقيقي",
    body: "Sharek يحوّل عملك المكتمل إلى سجل قابل للفهم والمشاركة، لا إلى شارات أو نقاط.",
  },
] as const;

const SUPPORT_EMAIL = "support@sharek.dev";

export function SupportView() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الدعم</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          لديك سؤال أو مشكلة تحتاج مساعدة؟ فريقنا هنا للمساعدة.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-input bg-primary/15 text-primary">
            <MessageCircleQuestion className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              تواصل معنا
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              أرسل رسالة إلى فريق الدعم وسنرد عليك عبر البريد الإلكتروني. الدردشة
              المباشرة داخل التطبيق قريبًا.
            </p>
          </div>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          راسلنا على {SUPPORT_EMAIL}
        </a>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground">عن Sharek</h2>
        <div className="mt-4 flex flex-col gap-4">
          {ABOUT_POINTS.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-3 rounded-card border border-border bg-card p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-border/40 text-primary">
                <point.icon className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{point.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {point.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
