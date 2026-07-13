import { Clock, Compass } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

/**
 * CJ-1 step 4: the human-review gate. Expectation copy per DEC-011; explore
 * stays open while applying remains gated.
 */
export function PendingReviewStep({ exploreHref }: { exploreHref: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">
          ملفك قيد المراجعة
        </h2>
        <StatusChip tone="waiting" icon={Clock}>
          قيد المراجعة
        </StatusChip>
      </div>

      <p className="mt-3 leading-7 text-muted-foreground">
        فريق المراجعة البشري يفحص المهارات المُولَّدة وأدلتها الآن —{" "}
        <b className="text-foreground">
          تُستكمل معظم المراجعات خلال 48 ساعة
        </b>
        ، وسنخبرك فور صدور القرار.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <a
          href={exploreHref}
          className="inline-flex items-center gap-2 rounded-input border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border/20"
        >
          <Compass className="size-4" />
          استكشف المشاريع في هذه الأثناء
        </a>
        <span className="text-xs text-muted-foreground">
          (التقديم يُفتح بعد اعتماد ملفك)
        </span>
      </div>
    </Card>
  );
}
