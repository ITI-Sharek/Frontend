import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10", className)}>
      {children}
    </div>
  );
}

/**
 * Every page opens the same way: a small kicker naming where you are, the
 * title, and one line explaining what the page is for. The rule underneath
 * carries a short indigo tick at the start edge — the same mark that opens
 * every section — so the page reads as one continuous document rather than a
 * stack of unrelated panels.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative pb-6", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance text-[26px] font-bold leading-tight text-foreground md:text-[34px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-2xl text-pretty text-[15px] leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <hr className="sk-rule mt-6" />
    </header>
  );
}

/**
 * Section heading used *on the field* rather than inside a card, so a page can
 * group records without wrapping every group in another box.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-subtle-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-pretty text-lg font-bold leading-snug text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Empty, error and not-found states. The hatch texture reads as reserved space
 * — a ruled area waiting to be filled — rather than as a panel that failed to
 * load, which is what a plain grey box communicates.
 */
export function PageFeedback({
  icon: Icon,
  title,
  description,
  action,
  command,
  className,
}: {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * The shell command this view is the output of, e.g. `ls contributions`.
   * Optional — pages that have no honest command equivalent omit it and get
   * the plain panel.
   */
  command?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)]",
        className,
      )}
    >
      {/*
       * Empty states as terminal output.
       *
       * The audience here writes software for a living, and "no results" is a
       * thing they read in a shell fifty times a day. Framing it that way says
       * the query ran and returned nothing — which is the actual message —
       * where a grey box with a sad icon only says something is missing.
       */}
      {command ? (
        <div className="flex items-center gap-2 border-b border-border bg-surface-fog px-4 py-2">
          <span className="flex gap-1" aria-hidden>
            <i className="block size-2 rounded-full bg-border-strong" />
            <i className="block size-2 rounded-full bg-border-strong" />
            <i className="block size-2 rounded-full bg-border-strong" />
          </span>
          <span
            dir="ltr"
            className="font-mono text-[11px] text-subtle-foreground"
          >
            sharek — zsh
          </span>
        </div>
      ) : null}

      <div className="sk-hatch flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
        {command ? (
          <p
            dir="ltr"
            className="mb-5 font-mono text-[13px] leading-6"
            aria-hidden
          >
            <span className="text-evidence-teal">➜</span>{" "}
            <span className="text-primary">~/sharek</span>{" "}
            <span className="text-foreground">{command}</span>
            <span className="ms-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.16em] bg-foreground/70" />
          </p>
        ) : Icon ? (
          <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-border-strong bg-card text-muted-foreground shadow-[var(--shadow-record)]">
            <Icon className="size-5" aria-hidden={true} />
          </span>
        ) : null}

        <h2 className="text-balance text-lg font-bold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-lg text-pretty text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}
