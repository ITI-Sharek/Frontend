import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PublicProjectApplicantDto } from "../types/public-project.types";

interface PublicProjectApplicantsTabProps {
  applicants: PublicProjectApplicantDto[];
  isLoading: boolean;
}

export function PublicProjectApplicantsTab({
  applicants,
  isLoading,
}: PublicProjectApplicantsTabProps) {
  const { t, i18n } = useTranslation();
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-record)]">
      <h2 className="text-base font-bold text-foreground sm:text-lg">{t("project.detail.applicantsTitle", "Applicants")}</h2>
      {isLoading ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("common.loading", "Loading...")}</p>
      ) : applicants.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("project.detail.noPublicApplicants", "There are no publicly visible applicants yet.")}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {applicants.map((applicant) => (
            <li key={applicant.applicationId} className="flex items-center gap-3 rounded-xl border border-border/70 p-3.5">
              {applicant.contributor.avatarUrl ? (
                <img src={applicant.contributor.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-4" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{applicant.contributor.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{applicant.contributor.username ? `@${applicant.contributor.username}` : t("project.detail.contributor", "Contributor")} · {applicant.contributionRequest.title}</p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground" dateTime={applicant.submittedAt}>{new Date(applicant.submittedAt).toLocaleDateString(i18n.language)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
