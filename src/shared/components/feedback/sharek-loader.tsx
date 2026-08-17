import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * The Share-k mark, animated.
 *
 * The logo is two figures — one indigo, one teal — curved into each other.
 * The loader plays the moment that shape is made: the two arcs swing in from
 * opposite sides, meet, and lock, and a pulse leaves the join. It is the
 * product's whole idea in one gesture (work handed over, then verified), so a
 * wait communicates rather than just spins.
 *
 * Pure SVG + CSS keyframes, defined in `src/styles.css` under "Route loader".
 */
export function SharekMarkLoader({
  size = 72,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* The track both figures travel on. */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="3"
      />

      {/*
       * Each figure is a 140° arc with a head — long enough to read as a body
       * curving around the circle at any frame of the animation, rather than
       * as a stray tick.
       */}
      <g className="sk-loader__ring">
        <path
          d="M50 16A34 34 0 0 1 76 71"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="16" r="8" fill="var(--primary)" />
      </g>

      <g className="sk-loader__ring sk-loader__ring--b">
        <path
          d="M50 84A34 34 0 0 1 24 29"
          stroke="var(--evidence-teal)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="84" r="8" fill="var(--evidence-teal)" />
      </g>

      {/* The handoff. */}
      <circle
        className="sk-loader__pulse"
        cx="50"
        cy="50"
        r="11"
        fill="none"
        stroke="var(--evidence-teal)"
        strokeWidth="2.5"
      />
      <circle cx="50" cy="50" r="4.5" fill="var(--primary)" />
    </svg>
  );
}

/**
 * The thin bar that covers fast navigations. It appears on its own for short
 * loads and sits above the veil for long ones, so there is never a frame where
 * the app looks frozen.
 */
export function RouteProgressBar() {
  const { t } = useTranslation();
  return (
    <div
      className="sk-progress"
      role="progressbar"
      aria-busy="true"
      aria-label={t("common.loading")}
    />
  );
}

/**
 * Full-screen route transition. Shown only once a navigation has run long
 * enough to notice (see `useDelayedFlag` at the call site) — flashing a veil
 * on an instant navigation reads as jank, not as polish.
 */
export function RouteTransitionVeil() {
  const { t } = useTranslation();

  return (
    <div
      className="sk-loader-veil fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-background/88 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <SharekMarkLoader size={84} className="text-foreground" />
      <p className="sk-loader__word text-sm font-bold tracking-[0.2em] text-muted-foreground">
        {t("brand.title")}
      </p>
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}
