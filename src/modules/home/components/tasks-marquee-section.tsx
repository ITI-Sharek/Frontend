import { InfiniteMovingCards } from "@/shared/components/ui/aceternity/infinite-moving-cards";

interface SampleTask {
  title: string;
  project: string;
  tech: string[];
  difficulty: string;
  reward?: string;
}

const SAMPLE_TASKS: SampleTask[] = [
  {
    title: "إضافة مصادقة عبر JWT",
    project: "NovaCommerce",
    tech: ["Node.js", "JWT"],
    difficulty: "متوسط",
    reward: "$120",
  },
  {
    title: "إصلاح اتجاه RTL في صفحة الدفع",
    project: "Souq UI Kit",
    tech: ["React", "CSS"],
    difficulty: "مبتدئ",
    reward: "$60",
  },
  {
    title: "كتابة Dockerfile لبيئة التجربة",
    project: "DevBox CLI",
    tech: ["Docker", "CI"],
    difficulty: "متوسط",
  },
  {
    title: "تحسين تغطية اختبارات المدفوعات",
    project: "NovaCommerce",
    tech: ["Jest", "TypeScript"],
    difficulty: "متقدم",
    reward: "$150",
  },
  {
    title: "إضافة قياسات لمحلّل النصوص العربية",
    project: "Nafes AI",
    tech: ["Python", "PyTorch"],
    difficulty: "متقدم",
    reward: "$200",
  },
  {
    title: "ترحيل موقع التوثيق إلى MDX",
    project: "DevBox CLI",
    tech: ["Next.js", "MDX"],
    difficulty: "مبتدئ",
  },
];

function TaskCard({ task }: { task: SampleTask }) {
  return (
    <article className="flex w-[300px] flex-col gap-3 rounded-card border border-border bg-card p-5">
      <h3 className="text-[15px] font-semibold text-foreground">
        {task.title}
      </h3>
      <span className="text-[13px] text-muted-foreground" dir="ltr">
        {task.project}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {task.tech.map((tech) => (
          <span
            key={tech}
            dir="ltr"
            className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {tech}
          </span>
        ))}
        <span className="rounded-full border border-brand-indigo/40 px-2.5 py-0.5 text-xs font-medium text-brand-indigo">
          {task.difficulty}
        </span>
      </div>
      <span className="text-[13px] font-semibold text-primary" dir="ltr">
        {task.reward ? `مكافأة ${task.reward}` : "بناء سمعة"}
      </span>
    </article>
  );
}

export function TasksMarqueeSection() {
  return (
    <section className="overflow-hidden bg-footer-bg py-20">
      <div className="mx-auto mb-8 flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <span className="text-[13px] font-medium tracking-wide text-primary">
          مهام مساهمة
        </span>
        <h2 className="max-w-lg text-3xl font-bold text-foreground">
          هكذا تبدو المهام على «شارك»
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          مهمة محددة، تقنيات مطلوبة، مستوى صعوبة، وموعد تسليم — وأحيانًا مكافأة.
        </p>
      </div>
      <InfiniteMovingCards
        speed="slow"
        items={SAMPLE_TASKS.map((task) => (
          <TaskCard key={task.title} task={task} />
        ))}
      />
    </section>
  );
}
