import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Status chip grammar (state-model §6): one shared shape for every workflow
 * status. Icon + text always — colour is never the only signal.
 * neutral = draft/info · waiting = in progress/waiting on someone ·
 * attention = needs *your* action · positive = positive terminal ·
 * negative = negative terminal · ai = AI processing.
 *
 * Each tone is a tinted field with a matching hairline rather than a flat
 * block of colour, so a row of chips reads as a legend instead of as a row of
 * buttons competing with the real actions on the page.
 */
const TONE_CLASSES = {
  neutral:
    "border-border-strong/70 bg-surface-fog text-muted-foreground",
  waiting:
    "border-primary/25 bg-primary-soft text-primary-soft-foreground",
  attention:
    "border-review-amber/35 bg-review-amber-soft text-review-amber",
  positive:
    "border-evidence-teal/30 bg-evidence-soft text-evidence-soft-foreground",
  negative:
    "border-destructive/25 bg-destructive-soft text-destructive",
  ai:
    "border-advisory-violet/30 bg-advisory-violet-soft text-advisory-violet",
} as const;

export type StatusChipTone = keyof typeof TONE_CLASSES;

interface StatusChipProps {
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}

export function StatusChip({
  tone,
  icon: Icon,
  children,
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-semibold leading-none",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="pt-px">{children}</span>
    </span>
  );
}
