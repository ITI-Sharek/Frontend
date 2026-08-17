import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type SharekLoaderSize = "sm" | "md" | "lg" | number;

export interface SharekLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the loader:
   * - "sm": 40px (inline / buttons / compact)
   * - "md": 72px (default / card / section)
   * - "lg": 84px (route veil / page overlay)
   * - Or a custom numeric pixel size
   */
  size?: SharekLoaderSize;
  /** Whether to show a text label beneath the loader */
  showLabel?: boolean;
  /** Custom text label (falls back to translated "common.loading") */
  label?: string;
  /** Whether to render the Arabic brand name "شارك" (default: true for md/lg, false for sm) */
  showWordmark?: boolean;
  /** Visual presentation variant */
  variant?: "default" | "inline" | "veil" | "card";
}

const SIZE_MAP: Record<"sm" | "md" | "lg", number> = {
  sm: 40,
  md: 72,
  lg: 84,
};

/**
 * Sharek Handoff Loader
 *
 * Exact implementation matching the Sharek brand motion:
 * - Subtle circular orbital track (r=34)
 * - Static central core dot (Institutional Indigo)
 * - Concentric verification pulse ring expanding from the core
 * - Two chasing orbital arcs (Evidence Teal and Institutional Indigo) with
 *   prominent circular head beads positioned precisely at the start of each arc
 * - Arabic wordmark "شارك" centered below
 */
export function SharekLoader({
  size = "md",
  showLabel = false,
  label,
  showWordmark,
  variant = "default",
  className,
  ...props
}: SharekLoaderProps) {
  const { t } = useTranslation();
  const numericSize = typeof size === "number" ? size : SIZE_MAP[size];
  const resolvedLabel = label ?? t("common.loading", "جارٍ التحميل...");
  // Show wordmark by default on medium and large unless explicitly set to false
  const shouldShowWordmark =
    showWordmark !== undefined ? showWordmark : numericSize >= 72 && variant !== "inline";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "sharek-loader inline-flex flex-col items-center justify-center select-none",
        variant === "inline" && "flex-row gap-2.5",
        variant === "veil" && "gap-4",
        variant === "card" && "gap-3 py-6",
        className
      )}
      {...props}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: numericSize, height: numericSize }}
      >
        <svg
          viewBox="0 0 100 100"
          width={numericSize}
          height={numericSize}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sharek-loader__svg overflow-visible"
          aria-hidden="true"
        >
          {/* 1. Orbit Track Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="34"
            className="sharek-loader__track stroke-border/40 dark:stroke-border/30"
            strokeWidth="3"
            fill="none"
          />

          {/* 2. Concentric Verification Pulse Ring (emanates from center core) */}
          <circle
            cx="50"
            cy="50"
            r="10"
            className="sharek-loader__pulse stroke-evidence-teal"
            strokeWidth="2"
            fill="none"
          />

          {/* 3. Static Center Core Node */}
          <circle
            cx="50"
            cy="50"
            r="4.5"
            className="sharek-loader__center-dot fill-brand-indigo"
          />

          {/* 4. Rotating Assembly: The Two Orbital Arcs with Leading Head Beads */}
          <g className="sharek-loader__rotor">
            {/* Arc 1: Evidence Teal */}
            <g className="sharek-loader__arc-group sharek-loader__arc-group--teal">
              <path
                d="M 58.8 17.16 A 34 34 0 0 1 76.04 71.85"
                className="sharek-loader__arc stroke-evidence-teal"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Head Bead on Teal Arc (positioned precisely on the arc start point) */}
              <circle
                cx="58.8"
                cy="17.16"
                r="6.2"
                className="sharek-loader__head fill-evidence-teal"
              />
            </g>

            {/* Arc 2: Institutional Indigo (180deg symmetrical) */}
            <g className="sharek-loader__arc-group sharek-loader__arc-group--indigo">
              <path
                d="M 41.2 82.84 A 34 34 0 0 1 23.96 28.15"
                className="sharek-loader__arc stroke-brand-indigo"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Head Bead on Indigo Arc (positioned precisely on the arc start point) */}
              <circle
                cx="41.2"
                cy="82.84"
                r="6.2"
                className="sharek-loader__head fill-brand-indigo"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Arabic Wordmark "شارك" */}
      {shouldShowWordmark && (
        <span
          className={cn(
            "sharek-loader__wordmark font-sans font-bold text-foreground/90 tracking-wide select-none",
            numericSize >= 84 ? "text-base" : "text-sm"
          )}
          aria-hidden="true"
        >
          شارك
        </span>
      )}

      {/* Optional Status Label */}
      {showLabel && (
        <span
          className={cn(
            "sharek-loader__label text-muted-foreground font-medium transition-opacity",
            numericSize <= 40 ? "text-xs" : "text-sm"
          )}
        >
          {resolvedLabel}
        </span>
      )}

      {/* Screen Reader Announcement */}
      <span className="sr-only">{resolvedLabel}</span>
    </div>
  );
}
