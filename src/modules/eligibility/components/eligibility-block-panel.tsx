import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useEligibilityGuidanceQuery } from "../api/queries/use-eligibility-guidance-query";
import { useRequestEligibilityGuidanceMutation } from "../api/mutations/use-request-eligibility-guidance-mutation";
import type {
  BlockingSkillDto,
  ProficiencyLevel,
} from "../types/eligibility.types";

/**
 * The block, rendered as "not yet, here is the path".
 *
 * Never as a rejection or a failure — that framing is the whole point of the
 * feature, so this panel carries no destructive colour, no error role, and no
 * language of refusal. The contributor has not done anything wrong; the
 * platform is telling them what is missing and where to go.
 */
export function EligibilityBlockPanel({
  blockingSkills,
  eligibilityEvaluationId,
  skillAnalysisHref,
  onRecoveryNavigate,
}: {
  blockingSkills: BlockingSkillDto[];
  /**
   * The recorded evaluation guidance hangs off. Absent on the TOCTOU path,
   * where the server refused at submit and the page never held an evaluation
   * id — the named skills are still shown, only the narrative is unavailable.
   */
  eligibilityEvaluationId?: string | null;
  skillAnalysisHref: string;
  /**
   * Carries the blocking skills into route state so the skill-analysis page can
   * highlight exactly what is missing rather than making the contributor
   * rediscover it there.
   */
  onRecoveryNavigate?: (blockingSkills: BlockingSkillDto[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className="mt-5 border-primary/25 bg-primary/5 p-5 shadow-none">
      <h2 className="text-lg font-bold text-foreground">
        {t("eligibility.block.title")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("eligibility.block.description")}
      </p>

      <BlockingSkillList blockingSkills={blockingSkills} />

      {eligibilityEvaluationId ? (
        <GuidanceSection eligibilityEvaluationId={eligibilityEvaluationId} />
      ) : null}

      <Button
        asChild
        className="mt-5"
        onClick={() => onRecoveryNavigate?.(blockingSkills)}
      >
        <a href={skillAnalysisHref}>{t("eligibility.block.recoveryAction")}</a>
      </Button>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        {t("eligibility.block.recoveryHelp")}
      </p>
    </Card>
  );
}

/**
 * Each blocking skill as a `required vs. yours` row.
 *
 * A real `<ul>` rather than a styled grid: the count and the boundaries between
 * entries have to be announced, and "three skills" is the first thing a screen
 * reader user needs. The `+/−` glyphs are the evidence-surface diff grammar,
 * and each is paired with text — nothing here is carried by colour or symbol
 * alone.
 */
function BlockingSkillList({
  blockingSkills,
}: {
  blockingSkills: BlockingSkillDto[];
}) {
  const { t } = useTranslation();
  return (
    <ul
      className="mt-4 grid gap-2"
      aria-label={t("eligibility.block.listLabel")}
    >
      {blockingSkills.map((skill) => (
        <li
          key={skill.skillName}
          className="rounded-input border border-border bg-background px-3 py-2.5"
        >
          {/* Skill names and levels are technical identifiers and stay LTR
              inside Arabic copy. */}
          <p dir="ltr" className="text-start font-mono text-sm text-foreground">
            {skill.skillName}
          </p>
          <div className="mt-1.5 grid gap-1 text-xs sm:grid-cols-2">
            <p className="text-muted-foreground">
              <span aria-hidden="true" className="font-mono">
                +{" "}
              </span>
              {t("eligibility.block.required")}:{" "}
              <span dir="ltr" className="font-medium text-foreground">
                {t(`eligibility.levels.${skill.requiredLevel}`)}
              </span>
            </p>
            <p className="text-muted-foreground">
              <span aria-hidden="true" className="font-mono">
                −{" "}
              </span>
              {t("eligibility.block.yours")}:{" "}
              <span dir="ltr" className="font-medium text-foreground">
                {skill.contributorLevel
                  ? t(`eligibility.levels.${skill.contributorLevel}`)
                  : t("eligibility.block.noApprovedEvidence")}
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The narrative, which arrives after the reason and never instead of it.
 *
 * Requested once on mount because the contributor should not have to know to
 * ask — the issue's "without having to know to ask" — while the server-side
 * request stays explicit, satisfying ADR 0014.
 */
function GuidanceSection({
  eligibilityEvaluationId,
}: {
  eligibilityEvaluationId: string;
}) {
  const { t } = useTranslation();
  const requestGuidance = useRequestEligibilityGuidanceMutation();
  const [guidanceId, setGuidanceId] = useState<string | null>(null);
  const [requestFailed, setRequestFailed] = useState(false);
  const guidanceQuery = useEligibilityGuidanceQuery(guidanceId);

  const { mutateAsync } = requestGuidance;
  useEffect(() => {
    let cancelled = false;
    void mutateAsync(eligibilityEvaluationId)
      .then((guidance) => {
        if (!cancelled) setGuidanceId(guidance.id);
      })
      .catch(() => {
        // The reason is already on screen. A guidance request that never lands
        // degrades this section and nothing else.
        if (!cancelled) setRequestFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [eligibilityEvaluationId, mutateAsync]);

  const status = requestFailed ? "failed" : (guidanceQuery.data?.status ?? "pending");
  const narrative = guidanceQuery.data?.narrative ?? null;

  return (
    <section className="mt-4 rounded-input border border-border bg-background p-3">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {t("eligibility.guidance.title")}
      </h3>
      {/*
        Polite, and it announces status only — it never moves focus. The
        contributor may be reading the skill list or already tabbing toward the
        recovery action when this resolves, and pulling them out of that would
        be worse than the narrative arriving unnoticed.
      */}
      <div aria-live="polite" className="mt-2 text-sm leading-6">
        {status === "pending" && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            {t("eligibility.guidance.pending")}
          </p>
        )}
        {status === "failed" && (
          <p className="text-muted-foreground">
            {t("eligibility.guidance.failed")}
          </p>
        )}
        {status === "ready" && narrative && (
          <p className="whitespace-pre-wrap text-foreground">{narrative}</p>
        )}
        {status === "ready" && !narrative && (
          <p className="text-muted-foreground">
            {t("eligibility.guidance.empty")}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * The submit control a blocked contributor sees.
 *
 * Disabled *and* named. `disabled` alone tells a screen reader user the button
 * cannot be pressed but not why, which is exactly the dead end this feature
 * exists to remove — so the accessible name carries the reason and points at
 * the explanation.
 */
export function BlockedSubmitAction({
  blockingSkillCount,
}: {
  blockingSkillCount: number;
}) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      disabled
      aria-disabled="true"
      aria-describedby="eligibility-block-panel"
      aria-label={t("eligibility.block.submitBlockedLabel", {
        count: blockingSkillCount,
      })}
    >
      {t("eligibility.block.submitBlocked")}
    </Button>
  );
}

export type { BlockingSkillDto, ProficiencyLevel };
