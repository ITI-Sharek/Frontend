import { useTranslation } from "react-i18next";

export function PublicProjectDiscussionsTab() {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-record)]">
      <h2 className="text-base font-bold text-foreground sm:text-lg">{t("project.detail.discussions", "Discussions")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("project.detail.discussionsPending", "Project discussions will appear here once the moderated discussion service is available.")}
      </p>
    </section>
  );
}
