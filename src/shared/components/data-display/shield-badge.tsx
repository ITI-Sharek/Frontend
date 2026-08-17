import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A shields.io-style status badge.
 *
 * Open source already has a universal grammar for "this claim was checked by a
 * machine": the two-tone badge stapled to the top of every README — a dark
 * label welded to a coloured value. `build | passing`, `coverage | 94%`,
 * `license | MIT`. Every developer reads it in a glance and knows it means an
 * automated check, not a self-assessment.
 *
 * That is precisely what Share-k's verified states are, so the product borrows
 * the form rather than inventing a private one. It carries the same provenance
 * tones as the evidence spine, so a teal badge and a teal spine mean the same
 * thing on any screen.
 */
const TONE = {
  verified: "bg-evidence-teal text-evidence-teal-foreground",
  active: "bg-primary text-primary-foreground",
  attention: "bg-review-amber text-white",
  ai: "bg-advisory-violet text-white",
  declined: "bg-destructive text-white",
  neutral: "bg-subtle-foreground text-white",
} as const;

export type ShieldTone = keyof typeof TONE;

export function ShieldBadge({
  label,
  value,
  tone = "neutral",
  icon: Icon,
  className,
}: {
  /** The left, always-dark half — what is being asserted. */
  label: string;
  /** The right, coloured half — the assertion itself. */
  value: ReactNode;
  tone?: ShieldTone;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <span
      /*
       * Badges are identifiers, so they stay LTR in both languages — the same
       * reason a repository slug does. Arabic values still render correctly
       * inside because each half is its own inline box.
       */
      dir="ltr"
      className={cn(
        "inline-flex select-none overflow-hidden rounded-social text-[11px] font-bold leading-none",
        "shadow-[0_1px_1px_rgba(19,26,23,0.16)]",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1 bg-[#3f4c47] px-2 py-1 text-white dark:bg-[#2b3833]">
        {Icon ? <Icon className="size-3" /> : null}
        {label}
      </span>
      <span className={cn("inline-flex items-center px-2 py-1", TONE[tone])}>
        {value}
      </span>
    </span>
  );
}
