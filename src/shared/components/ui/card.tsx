import * as React from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A card is a *record* — one addressable thing in the ledger. It sits on the
 * page's field surface as a sheet of paper does on a desk: hairline edge,
 * shallow shadow, no glass and no gradient.
 *
 * `spine` marks where the record's information came from; see the evidence
 * spine block in `src/styles.css` for the full legend.
 */
const cardVariants = cva(
  "relative w-full rounded-card border border-border bg-card shadow-[var(--shadow-record)]",
  {
    variants: {
      padding: {
        default: "p-5 md:p-6",
        compact: "p-4",
        roomy: "p-6 md:p-8",
        none: "p-0",
      },
      tone: {
        default: "",
        /* Recedes: context rather than content. */
        quiet: "bg-card-raised shadow-none",
        /* A record the platform has verified. */
        evidence: "border-evidence-teal/30 bg-evidence-soft/50",
        /* Something is waiting on the reader. */
        attention: "border-review-amber/35 bg-review-amber-soft/60",
        /* Flat, for cards that live inside another surface. */
        flat: "shadow-none",
      },
    },
    defaultVariants: {
      padding: "default",
      tone: "default",
    },
  },
);

type Provenance =
  | "verified"
  | "active"
  | "attention"
  | "ai"
  | "declined"
  | "neutral";

interface CardProps
  extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  /** Draws the evidence spine on the inline-start edge. */
  spine?: Provenance;
  /** Lifts the card on hover. Only for cards that are themselves clickable. */
  interactive?: boolean;
}

function Card({
  className,
  padding,
  tone,
  spine,
  interactive,
  ...props
}: CardProps) {
  return (
    <div
      data-spine={spine}
      data-card-hover={interactive ? "" : undefined}
      className={cn(
        cardVariants({ padding, tone }),
        spine && "rounded-s-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Card, cardVariants };
export type { Provenance };
