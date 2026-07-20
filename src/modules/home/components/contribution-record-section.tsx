import { ContributionLedgerIllustration } from "./illustrations/contribution-ledger-illustration";

const RECORD_POINTS = [
  {
    term: "يتراكم ولا يُعاد بناؤه",
    description:
      "كل مساهمة مكتملة تضيف سطراً جديداً إلى السجل. لا يبدأ من الصفر مع كل مشروع، ولا يُمحى عند مغادرته.",
  },
  {
    term: "حالته صادقة",
    description:
      "ما اكتمل تحقّقه يظهر متحققاً منه، وما يزال قيد المراجعة يظهر كذلك — لا يتحول انتظار المراجعة إلى ادعاء مؤكد.",
  },
  {
    term: "يُشارك بحدود واضحة",
    description:
      "أنت تقرر ما يُعرض علناً وما يبقى خاصاً. ما يُنشر يحمل سياقه ودليله، لا عنواناً بلا إسناد.",
  },
] as const;

export function ContributionRecordSection() {
  return (
    <section
      id="record"
      className="scroll-mt-24 border-y border-border bg-footer-bg py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <ContributionLedgerIllustration className="order-2 h-auto w-full max-w-lg justify-self-center lg:order-1 lg:justify-self-start" />

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              المساهمة تنتهي، والسجل يبقى — ويتراكم.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-muted-foreground">
              ما تنجزه عبر Sharek لا يتحول إلى رقم في عدّاد، بل إلى سطر في
              سجل مهني يجيب عن الأسئلة التي تهم فعلاً: ماذا أُنجز، ومن راجعه،
              وما الدليل عليه.
            </p>
            <dl className="mt-8 border-t border-border">
              {RECORD_POINTS.map((point) => (
                <div
                  key={point.term}
                  className="grid gap-1.5 border-b border-border py-5"
                >
                  <dt className="font-semibold text-foreground">
                    {point.term}
                  </dt>
                  <dd className="max-w-[62ch] text-sm leading-7 text-muted-foreground">
                    {point.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
