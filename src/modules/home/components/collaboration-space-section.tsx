import { WorkspaceIllustration } from "./illustrations/workspace-illustration";

const WORKSPACE_POINTS = [
  {
    term: "مهمة واحدة بنطاق واضح",
    description:
      "ما المطلوب، وكيف يُراجع، وما الأدلة المتوقعة عند التسليم — يُعلن قبل بدء العمل لا بعده.",
  },
  {
    term: "نقاش يحفظ سياقه",
    description:
      "الأسئلة والقرارات تبقى مرتبطة بالمهمة نفسها، فلا تضيع في أدوات متفرقة ولا تُعاد روايتها من الذاكرة.",
  },
  {
    term: "حالات صريحة لا تُخمَّن",
    description:
      "قيد التنفيذ، جاهز للمراجعة، مقبول — كل انتقال معلن، والطرفان يريان الحالة نفسها في اللحظة نفسها.",
  },
] as const;

export function CollaborationSpaceSection() {
  return (
    <section id="workspace" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              بعد القبول، يتحول الاتفاق إلى مساحة عمل واحدة.
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-muted-foreground">
              كل مساهمة مقبولة تحصل على مساحتها الخاصة: المهمة، والنقاش،
              والتسليم في مكان واحد يربطها خيط تدقيق واحد. ما يحدث هناك لا
              يتبخر عند الانتهاء، بل يصبح جزءاً من دليل المساهمة.
            </p>
            <dl className="mt-8 border-t border-border">
              {WORKSPACE_POINTS.map((point) => (
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

          <WorkspaceIllustration className="h-auto w-full max-w-xl justify-self-center lg:justify-self-start" />
        </div>
      </div>
    </section>
  );
}
