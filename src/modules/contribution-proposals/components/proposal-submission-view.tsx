import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Card } from "@/shared/components/ui/card";

import { ProposalEditor } from "./proposal-editor";
import type { ContributionProposalFields } from "../types/contribution-proposal.types";

export function ProposalSubmissionView({
  projectName,
  isSubmitting,
  error,
  onSubmit,
  submissionBlockSlot,
}: {
  /** Empty when the page was opened directly rather than from the project. */
  projectName: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (fields: ContributionProposalFields) => Promise<void>;
  /**
   * The eligibility gate (DEC-078), composed by the route because it belongs to
   * the eligibility module and modules never import each other.
   *
   * Unlike the task detail there is no pre-flight here: the bar is inferred
   * from the proposal's own text, which does not exist until it is written. So
   * this only ever appears after a refused submit.
   */
  submissionBlockSlot?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <Link to={ROUTES.publicProjects} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" /> {t("proposalSubmission.backToProjects")}
      </Link>
      <header className="mt-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("proposalSubmission.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("proposalSubmission.description")}
            </p>
          </div>
        </div>
      </header>
      <Card className="mt-5">
        {/* A raw UUID told the contributor nothing about which project they
            were proposing to. The name is carried from the page they came
            from; without it the line is omitted entirely, because an
            identifier is worse than saying nothing. */}
        {projectName ? (
          <p className="mb-5 text-xs text-muted-foreground">
            {t("proposalSubmission.project")} <span className="font-semibold text-foreground">{projectName}</span>
          </p>
        ) : null}
        {/*
          Above the editor, and the editor stays. The proposer's words are
          still in the form and the block is a "not yet" — clearing what they
          wrote would punish them for a gap they can close.
        */}
        {submissionBlockSlot}
        <ProposalEditor
          requiresDisclosure
          isSubmitting={isSubmitting}
          submitLabel={t("proposalSubmission.submitLabel")}
          error={error}
          onSubmit={onSubmit}
        />
      </Card>
    </div>
  );
}
