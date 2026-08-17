import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { SectionHeading } from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";

import type { AttentionItemDto } from "../types/dashboard.types";

/**
 * WF-02 "NEEDS YOUR ATTENTION": one joined card, one inline action per item,
 * amber for revise-and-resubmit, teal for accepted-start-working.
 *
 * This is the only block on the dashboard that is *owed* something by the
 * reader, so it is the only one that carries a spine on every row. Everything
 * below it is information; this is a queue.
 */
export function AttentionFeed({ items }: { items: AttentionItemDto[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <section
      id="attention"
      className="scroll-mt-28"
      aria-labelledby="attention-heading"
    >
      <SectionHeading
        eyebrow={
          <span className="text-review-amber">
            {t("dashboard.attention.eyebrow")}
          </span>
        }
        title={
          <span id="attention-heading">{t("dashboard.attention.title")}</span>
        }
        action={
          <span className="tnum inline-flex items-center rounded-full border border-review-amber/35 bg-review-amber-soft px-2.5 py-1 text-xs font-semibold text-review-amber">
            {t("dashboard.attention.count", { count: items.length })}
          </span>
        }
      />

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)]">
        {items.map((item, index) => {
          const needsRevision = item.kind === "changes_requested";
          return (
            <div
              key={item.id}
              data-spine={needsRevision ? "attention" : "verified"}
              style={{ animationDelay: `${Math.min(index, 4) * 45}ms` }}
              className={[
                "sk-rise group relative flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
                "transition-colors duration-150 hover:bg-surface-fog/60",
                index > 0 ? "border-t border-border" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-9 shrink-0 items-center justify-center self-start rounded-full sm:self-center",
                  needsRevision
                    ? "bg-review-amber-soft text-review-amber"
                    : "bg-evidence-soft text-evidence-teal",
                ].join(" ")}
              >
                {needsRevision ? (
                  <TriangleAlert className="size-4.5" />
                ) : (
                  <CheckCircle2 className="size-4.5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="bidi text-pretty font-semibold leading-snug text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.subtitle}
                </p>
              </div>

              <Button
                asChild
                size="sm"
                variant={index === 0 ? "primary" : "outline"}
                className="shrink-0 self-start sm:self-center"
              >
                <Link to={ROUTES.tasks}>
                  {item.actionLabel}
                  <DirectionalArrow className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
