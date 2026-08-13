import { MessageCircleQuestion, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const SUPPORT_EMAIL = "support@sharek.dev";

export function SupportView() {
  const { t } = useTranslation();
  const aboutPoints = [
    { icon: ShieldCheck, title: t("support.points.evidence.title"), body: t("support.points.evidence.body") },
    { icon: Users, title: t("support.points.human.title"), body: t("support.points.human.body") },
    { icon: Sparkles, title: t("support.points.record.title"), body: t("support.points.record.body") },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("support.title")}</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t("support.description")}
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-input bg-primary/15 text-primary">
            <MessageCircleQuestion className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("support.contactTitle")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("support.contactDescription")}
            </p>
          </div>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {t("support.emailAction", { email: SUPPORT_EMAIL })}
        </a>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground">{t("support.aboutTitle")}</h2>
        <div className="mt-4 flex flex-col gap-4">
          {aboutPoints.map((point) => (
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
