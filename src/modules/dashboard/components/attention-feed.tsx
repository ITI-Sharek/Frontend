import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { AttentionItemDto } from "../types/dashboard.types";

/**
 * WF-02 "NEEDS YOUR ATTENTION": one joined card, one inline action per item,
 * amber for revise-and-resubmit, teal for accepted-start-working.
 */
export function AttentionFeed({ items }: { items: AttentionItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="attention-heading">
      <h2
        id="attention-heading"
        className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground"
      >
        يحتاج انتباهك
      </h2>
      <div className="mt-3 divide-y divide-border rounded-card border border-border bg-card">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          >
            <span
              className={
                item.kind === "changes_requested"
                  ? "mt-0.5 shrink-0 self-start text-amber-500 sm:self-center"
                  : "mt-0.5 shrink-0 self-start text-primary sm:self-center"
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
            <Button size="sm" variant="outline" className="shrink-0 self-start sm:self-center">
              {item.actionLabel}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
