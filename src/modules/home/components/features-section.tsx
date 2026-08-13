import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileCheck2,
  GitPullRequest,
  Link2,
  UserRoundCheck,
} from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

function getEvidenceFields(t: TFunction) {
  return [
    {
      term: t("landing.evidenceSourceTerm"),
      description: t("landing.evidenceSourceDescription"),
    },
    {
      term: t("landing.evidenceMethodTerm"),
      description: t("landing.evidenceMethodDescription"),
    },
    {
      term: t("landing.evidenceVisibilityTerm"),
      description: t("landing.evidenceVisibilityDescription"),
    },
    {
      term: t("landing.evidenceFreshnessTerm"),
      description: t("landing.evidenceFreshnessDescription"),
    },
  ];
}

export function FeaturesSection() {
  const { t } = useTranslation();
  const evidenceFields = getEvidenceFields(t);

  return (
    <section
      id="evidence"
      className="scroll-mt-24 border-y border-border bg-footer-bg py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex max-w-3xl flex-col gap-4">
          <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {t("landing.evidenceHeading")}
          </h2>
          <p className="max-w-[68ch] text-base leading-8 text-muted-foreground">
            {t("landing.evidenceDescription")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <article className="rounded-card border border-border bg-card">
            <header className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <GitPullRequest className="size-5" aria-hidden />
                  <span>{t("landing.evidenceCompletedContribution")}</span>
                </div>
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  {t("landing.evidenceSampleTitle")}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {t("landing.evidenceSampleDescription")}
                </p>
              </div>
              <span className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-full bg-evidence-teal px-3 text-sm font-semibold text-evidence-teal-foreground">
                <CheckCircle2 className="size-4" aria-hidden />
                {t("landing.evidenceVerifiedBadge")}
              </span>
            </header>

            <dl>
              {evidenceFields.map((field) => (
                <div
                  key={field.term}
                  className="grid gap-2 border-b border-border px-6 py-5 last:border-b-0 sm:grid-cols-[170px_1fr] sm:gap-6 sm:px-8"
                >
                  <dt className="font-semibold text-foreground">
                    {field.term}
                  </dt>
                  <dd className="text-sm leading-7 text-muted-foreground">
                    {field.description}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <div className="flex flex-col gap-6">
            <section className="rounded-card border border-advisory-violet/40 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3 text-advisory-violet">
                <AlertCircle className="size-5" aria-hidden />
                <h3 className="text-lg font-bold">{t("landing.evidenceAiAdvisoryTitle")}</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {t("landing.evidenceAiAdvisoryDescription")}
              </p>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <FileCheck2
                    className="mt-1 size-5 shrink-0 text-advisory-violet"
                    aria-hidden
                  />
                  <span>
                    <b className="text-foreground">{t("landing.evidenceSupportingEvidenceLabel")}</b>{" "}
                    {t("landing.evidenceSupportingEvidenceText")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Eye
                    className="mt-1 size-5 shrink-0 text-advisory-violet"
                    aria-hidden
                  />
                  <span>
                    <b className="text-foreground">{t("landing.evidenceVisibilityLimitLabel")}</b>{" "}
                    {t("landing.evidenceVisibilityLimitText")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <UserRoundCheck
                    className="mt-1 size-5 shrink-0 text-advisory-violet"
                    aria-hidden
                  />
                  <span>
                    <b className="text-foreground">{t("landing.evidenceHumanPathLabel")}</b>{" "}
                    {t("landing.evidenceHumanPathText")}
                  </span>
                </li>
              </ul>
            </section>

            <section className="border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <Link2 className="size-5 text-primary" aria-hidden />
                <h3 className="text-lg font-bold text-foreground">
                  {t("landing.evidenceNotOnlyGithub")}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t("landing.evidenceNotOnlyGithubDescription")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
