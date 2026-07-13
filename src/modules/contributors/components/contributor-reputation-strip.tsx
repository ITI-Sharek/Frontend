import { GitPullRequest, MessageSquare, Star, Timer } from "lucide-react";
import type { ComponentType } from "react";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Reputation strip (screen-inventory §1.8): the at-a-glance trust row under
 * the identity header. Desktop: one row; mobile: 2×2 grid. Success rate
 * (FR-070) is omitted until the profile API exposes it — nothing fabricated.
 */
export function ContributorReputationStrip({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { rating, reviewsCount } = profile.reputationSummary;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-4">
      <StripCell
        icon={Star}
        label="التقييم"
        value={rating === null ? "جديد" : `${rating.toFixed(1)} / 5`}
        hint={
          rating === null ? "يُبنى من التسليمات المعتمدة" : "من مراجعات أصحاب المشاريع"
        }
      />
      <StripCell
        icon={MessageSquare}
        label="المراجعات"
        value={String(reviewsCount)}
        hint="مراجعات مستلمة"
      />
      <StripCell
        icon={GitPullRequest}
        label="المساهمات"
        value={String(profile.contributionHistory.length)}
        hint="مساهمات موثقة في الملف"
      />
      <StripCell
        icon={Timer}
        label="الإتاحة"
        value={profile.availability ?? "غير محددة"}
        hint="تحديث الإتاحة يساعد في المطابقة"
      />
    </div>
  );
}

function StripCell({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-card p-5">
      <span className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      <span className="text-xl font-bold text-foreground">
        <bdi>{value}</bdi>
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}
