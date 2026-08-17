import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The ledger's number treatment.
 *
 * A figure and its unit are not the same kind of information, so they are not
 * set the same way: the value is large, tight and tabular; the unit rides
 * alongside at body weight. That single rule is what makes a reward read as
 * money and a rating read as a score, without either needing an icon.
 */
export function StatValue({
  value,
  unit,
  size = "md",
  tone = "default",
  className,
}: {
  value: ReactNode;
  unit?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "default" | "evidence" | "primary" | "muted";
  className?: string;
}) {
  const sizeClass = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-[26px] leading-8",
    xl: "text-[34px] leading-10",
  }[size];

  const unitClass = {
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-[13px]",
    xl: "text-sm",
  }[size];

  const toneClass = {
    default: "text-foreground",
    evidence: "text-evidence-teal",
    primary: "text-primary",
    muted: "text-muted-foreground",
  }[tone];

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span
        className={cn("tnum font-bold tracking-tight", sizeClass, toneClass)}
      >
        {value}
      </span>
      {unit ? (
        <span
          className={cn(
            "font-semibold uppercase tracking-wide text-subtle-foreground",
            unitClass,
          )}
        >
          {unit}
        </span>
      ) : null}
    </span>
  );
}

/**
 * A labelled figure in a rail or a summary strip. The label sits *under* the
 * number rather than above it, so a column of these scans as a row of results
 * first and a row of captions second.
 */
export function StatBlock({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "default",
  size = "lg",
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone?: "default" | "evidence" | "primary" | "muted";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-1.5">
        {Icon ? (
          <Icon
            className={cn(
              "size-3.5 shrink-0",
              tone === "evidence" ? "text-evidence-teal" : "text-subtle-foreground",
            )}
            aria-hidden={true}
          />
        ) : null}
        <StatValue value={value} unit={unit} size={size} tone={tone} />
      </div>
      <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
        {label}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] leading-4 text-subtle-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Progress as a measurement rule. `value` and `max` are the real numbers so
 * the bar can carry proper ARIA without the caller repeating itself.
 */
export function Meter({
  value,
  max = 100,
  tone = "primary",
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: "primary" | "evidence" | "attention";
  label?: string;
  className?: string;
}) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div
      className={cn("sk-meter", className)}
      data-tone={tone === "primary" ? undefined : tone}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
