import { ArrowLeft, CheckCircle2, TriangleAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

import type { AttentionItemDto } from "../types/dashboard.types";

/**
 * WF-02 "NEEDS YOUR ATTENTION": one joined card, one inline action per item,
 * amber for revise-and-resubmit, teal for accepted-start-working.
 */
export function AttentionFeed({ items }: { items: AttentionItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="attention"
      className="scroll-mt-28"
      aria-labelledby="attention-heading"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-review-amber">
            الأولوية الآن
          </p>
          <h2
            id="attention-heading"
            className="mt-1 text-xl font-bold text-foreground"
          >
            يحتاج انتباهك
          </h2>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {items.length} إجراء
        </span>
      </div>
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col gap-3 p-4 transition-colors hover:bg-surface-fog/70 sm:flex-row sm:items-center sm:p-5"
          >
            <span
              className={
                item.kind === "changes_requested"
                  ? "mt-0.5 shrink-0 self-start text-amber-500 sm:self-center"
                  : "mt-0.5 shrink-0 self-start text-evidence-teal sm:self-center"
              }
            >
              {item.kind === "changes_requested" ? (
                <TriangleAlert className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="shrink-0 self-start sm:self-center"
            >
              <Link to={ROUTES.tasks}>
                {item.actionLabel}
                <ArrowLeft
                  className="size-4 transition-transform group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
