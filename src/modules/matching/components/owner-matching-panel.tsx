import { CircleAlert, Loader2, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import {
  useGenerateOwnerMatchesMutation,
  useInviteMatchedContributorMutation,
} from "../api/mutations/use-matching-mutations";
import { useOwnerMatchesQuery } from "../api/queries/use-matching-queries";
import type { ContributorMatchDto, MatchingConfidence } from "../types/matching.types";

function confidenceLabel(confidence: MatchingConfidence) {
  return confidence === "HIGH" ? "عالية" : confidence === "MEDIUM" ? "متوسطة" : "منخفضة";
}

function scoreLabel(score: number) {
  return `${Math.round(score * 100)}%`;
}

function MatchCard({
  match,
  onInvite,
  invited,
  inviting,
}: {
  match: ContributorMatchDto;
  onInvite: () => void;
  invited: boolean;
  inviting: boolean;
}) {
  return (
    <article className="grid gap-4 rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">#{match.rank}</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            {match.contributorUsername ? (
              <a
                href={ROUTES.contributorProfile(match.contributorUsername)}
                className="hover:text-primary"
              >
                {match.contributorName}
              </a>
            ) : (
              match.contributorName
            )}
          </h3>
        </div>
        <div className="text-end text-xs text-muted-foreground">
          <p>الأهمية: {scoreLabel(match.matchScore)}</p>
          <p className="mt-1">الثقة: {confidenceLabel(match.confidence)}</p>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{match.justification}</p>

      <div className="flex flex-wrap gap-2">
        {match.matchedSkills.map((skill) => (
          <span
            key={`${skill.name}-${skill.proficiency}`}
            dir="ltr"
            className="rounded-full border border-evidence-teal/40 bg-evidence-teal/10 px-2.5 py-1 font-mono text-xs text-evidence-teal"
          >
            {skill.name} · {skill.proficiency}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground" dir="ltr">
          مصادر الأدلة: {match.evidenceIds.length}
        </span>
        <Button
          type="button"
          size="sm"
          variant={invited ? "outline" : "primary"}
          disabled={invited || inviting}
          onClick={onInvite}
        >
          {inviting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          {invited ? "تم إرسال الدعوة" : "دعوة للتقديم"}
        </Button>
      </div>
    </article>
  );
}

export function OwnerMatchingPanel({ requestId }: { requestId: string }) {
  const query = useOwnerMatchesQuery(requestId);
  const generateMutation = useGenerateOwnerMatchesMutation(requestId);
  const inviteMutation = useInviteMatchedContributorMutation(requestId);
  const [invitedContributorId, setInvitedContributorId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  if (query.isPending) {
    return (
      <Card className="mt-6 flex items-center gap-2 text-sm text-muted-foreground shadow-none" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جارٍ تحميل المطابقات باستخدام الأدلة المعتمدة…
      </Card>
    );
  }

  if (query.isError && getApiErrorCode(query.error) === "CONTRIBUTOR_MATCHING_PLAN_REQUIRED") {
    return (
      <Card className="mt-6 grid gap-3 border-dashed shadow-none">
        <h2 className="text-lg font-bold text-foreground">المطابقة بالذكاء الاصطناعي متاحة مع Silver وGold</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          هذه المعاينة لا تعرض هويات أو أدلة للمطابقات غير المتاحة. يمكنك متابعة
          مراجعة طلبات التقديم بالطريقة العادية.
        </p>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card className="mt-6 grid gap-3 shadow-none" role="alert">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="size-4" aria-hidden />
          تعذّر تحميل المطابقات.
        </p>
        <Button type="button" variant="outline" className="w-fit" onClick={() => void query.refetch()}>
          إعادة المحاولة
        </Button>
      </Card>
    );
  }

  const response = query.data;
  const generate = async () => {
    setInviteError(null);
    await generateMutation.mutateAsync();
  };

  const invite = async (contributorId: string) => {
    setInviteError(null);
    try {
      await inviteMutation.mutateAsync(contributorId);
      setInvitedContributorId(contributorId);
    } catch {
      setInviteError("تعذّر إرسال الدعوة. يمكنك المحاولة مرة أخرى.");
    }
  };

  return (
    <section className="mt-6 grid gap-5" aria-labelledby="owner-matching-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold text-evidence-teal-foreground dark:text-evidence-teal">
            <ShieldCheck className="size-4" aria-hidden />
            {response.planType === "gold" ? "Gold · حتى 10 مطابَقات" : "Silver · حتى 5 مطابَقات"}
          </p>
          <h2 id="owner-matching-title" className="mt-1 text-xl font-bold text-foreground">
            مساهمون مطابقون
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            اقتراحات إرشادية مبنية على المهارات المعتمدة وسمعة المساهم والأدلة المصرح بها. القرار لك، والمطابقة ليست اختيارًا.
          </p>
        </div>
        {(response.matches.length === 0 || response.status === "system_limit") && (
          <Button type="button" size="sm" variant="outline" onClick={() => void generate()} disabled={generateMutation.isPending}>
            {generateMutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {response.status === "system_limit" ? "إعادة المحاولة" : "توليد المطابقات"}
          </Button>
        )}
      </div>

      {inviteError && <p role="alert" className="text-sm text-destructive">{inviteError}</p>}
      {response.status === "system_limit" && (
        <p role="status" className="rounded-input border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-6 text-muted-foreground">
          المطابقة متوقفة مؤقتًا بسبب حد تقني. لم يتغير الطلب ويمكنك إعادة المحاولة.
        </p>
      )}
      {response.matches.length === 0 && response.status !== "system_limit" ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm leading-6 text-muted-foreground">
            لا توجد اقتراحات مطابقة بعد. يمكنك الاستمرار في مراجعة طلبات التقديم العادية.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {response.matches.map((match) => (
            <MatchCard
              key={match.contributorId}
              match={match}
              invited={invitedContributorId === match.contributorId}
              inviting={inviteMutation.isPending}
              onInvite={() => void invite(match.contributorId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
