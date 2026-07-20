import { Github, Star } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Stats side panel (screen-inventory §1.8 reputation data), styled as a
 * freelance-marketplace stats box: header bar, divider rows with the label
 * at the start and the value at the end, star rating, and percentage chips.
 * Only real API data — success rate (FR-070) is omitted until the backend
 * exposes it.
 */
export function ContributorReputationStrip({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { rating, reviewsCount } = profile.reputationSummary;
  const verifiedCount = profile.skills.filter(
    (skill) => skill.status === "approved",
  ).length;
  const verifiedPercent =
    profile.skills.length === 0
      ? null
      : Math.round((verifiedCount / profile.skills.length) * 100);

  return (
    <div className="h-full overflow-hidden rounded-card border border-border bg-card">
      <h2 className="border-b border-border bg-background px-5 py-3.5 text-base font-bold text-foreground">
        إحصائيات
      </h2>
      <dl className="px-5">
        <StatRow label="التقييمات">
          {rating === null ? (
            <span className="text-sm text-muted-foreground">جديد</span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={rating} />
              <span dir="ltr" className="text-xs text-muted-foreground">
                ({reviewsCount})
              </span>
            </span>
          )}
        </StatRow>

        <StatRow label="المهارات الموثقة">
          {verifiedPercent === null ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            <PercentChip percent={verifiedPercent} />
          )}
        </StatRow>

        <StatRow label="المساهمات المكتملة">
          <span className="text-sm font-bold text-foreground">
            {profile.contributionHistory.length}
          </span>
        </StatRow>

        <StatRow label="الإتاحة">
          <span className="text-sm font-medium text-foreground">
            {profile.availability ?? "غير محددة"}
          </span>
        </StatRow>

        <StatRow label="حساب GitHub" last>
          {profile.githubStatus.connected ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Github className="size-4" />
              متصل
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">غير متصل</span>
          )}
        </StatRow>
      </dl>
    </div>
  );
}

function StatRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3.5",
        !last && "border-b border-border",
      )}
    >
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      dir="ltr"
      className="inline-flex"
      role="img"
      aria-label={`التقييم ${rating.toFixed(1)} من 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-border text-border",
          )}
        />
      ))}
    </span>
  );
}

function PercentChip({ percent }: { percent: number }) {
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-block min-w-14 rounded-sm px-2 py-1 text-center font-mono text-[11px] leading-none tracking-[0.65px]",
        percent >= 60
          ? "bg-evidence-teal/15 text-evidence-teal"
          : "bg-border/60 text-muted-foreground",
      )}
    >
      {percent}%
    </span>
  );
}
