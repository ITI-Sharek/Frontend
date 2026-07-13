import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Status chip grammar (state-model §6): one shared shape for every workflow
 * status. Icon + text always — color is never the only signal.
 * neutral = draft/info · waiting = in progress/waiting on someone ·
 * attention = needs *your* action · positive = positive terminal ·
 * negative = negative terminal · ai = AI processing.
 */
const TONE_CLASSES = {
  neutral: "bg-border/40 text-muted-foreground",
  waiting: "bg-brand-indigo/10 text-brand-indigo",
  attention: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  positive: "bg-primary/10 text-primary",
  negative: "bg-destructive/10 text-destructive",
  ai: "bg-[#6B5CA5]/10 text-[#6B5CA5] dark:bg-[#A78BFA]/15 dark:text-[#A78BFA]",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {children}
    </span>
  );
}
