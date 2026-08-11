import { BadgeCheck, CircleAlert, Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useSubscriptionStatusQuery } from "../api/queries/use-subscription-query";
import type {
  SubscriptionBenefitDto,
  SubscriptionPlan,
} from "../types/subscription.types";

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "long",
  }).format(new Date(value));
}

function Benefit({ benefit }: { benefit: SubscriptionBenefitDto }) {
  const included = benefit.state === "included";
  return (
    <li className="flex items-start gap-2 text-sm leading-6 text-foreground">
      {included ? (
        <BadgeCheck
          className="mt-1 size-4 shrink-0 text-evidence-teal"
          aria-hidden
        />
      ) : (
        <LockKeyhole
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className={included ? undefined : "text-muted-foreground"}>
        {benefit.label}
      </span>
    </li>
  );
}

export function SubscriptionSettingsSection() {
  const query = useSubscriptionStatusQuery();

  if (query.isPending) {
    return (
      <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جارٍ تحميل حالة الاشتراك…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div role="alert" className="grid gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CircleAlert className="size-4" aria-hidden />
          تعذّر تحميل حالة الاشتراك.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => void query.refetch()}
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const status = query.data;
  const usagePercent = status.usage
    ? Math.min(100, Math.round((status.usage.used / status.usage.limit) * 100))
    : 0;

  return (
    <section aria-labelledby="subscription-settings-title" className="grid gap-5">
      <div>
        <h2 id="subscription-settings-title" className="text-lg font-bold text-foreground">
          الاشتراك والمزايا
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          حالة الخطة والمزايا الحالية تأتي من حسابك على الخادم.
        </p>
      </div>

      <Card className="grid gap-5 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              خطتك الحالية
            </p>
            <h3 className="mt-1 text-2xl font-bold text-foreground">
              {PLAN_LABELS[status.plan]}
            </h3>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
            {status.status === "active" ? "نشطة" : status.status}
          </span>
        </div>

        {status.usage ? (
          <div className="grid gap-2" aria-labelledby="subscription-usage-title">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span id="subscription-usage-title" className="font-semibold text-foreground">
                استخدام طلبات المساهمة هذا الشهر
              </span>
              <span className="font-mono text-muted-foreground" dir="ltr">
                {status.usage.used} من {status.usage.limit}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-label="استخدام طلبات المساهمة"
              aria-valuemin={0}
              aria-valuemax={status.usage.limit}
              aria-valuenow={status.usage.used}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              يتجدد الحد في {formatDate(status.usage.periodEnd)}.
            </p>
          </div>
        ) : (
          <p className="rounded-input border border-border bg-surface-fog p-3 text-sm leading-6 text-muted-foreground">
            التقديم على طلبات المساهمة متاح وفق القواعد العادية، ولا توجد حصة
            يومية مرتبطة بخطة المساهم.
          </p>
        )}

        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-foreground">المزايا</h4>
          <ul className="mt-3 grid gap-2">
            {status.benefits.map((benefit) => (
              <Benefit key={benefit.key} benefit={benefit} />
            ))}
          </ul>
        </div>

        {status.plan !== "gold" && (
          <div className="grid gap-2 border-t border-border pt-4">
            <Button type="button" disabled className="w-fit">
              الترقية غير متاحة في معاينة MVP
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              شراء الخطط غير متاح خلال معاينة MVP.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
