import { cn } from "@/lib/utils";

export interface RouteProgressBarProps {
  /** Current progress percentage (0 - 100) */
  progress: number;
  /** Whether the progress bar is visible */
  visible: boolean;
  /** Optional custom class names */
  className?: string;
}

/**
 * Tier 1 Navigation Progress Bar.
 *
 * Appears after 90ms of route pending state.
 * Stays visible for at least 380ms to avoid flickers on fast navigations.
 * Subtle gradient bar with glowing evidence-teal head.
 */
export function RouteProgressBar({
  progress,
  visible,
  className,
}: RouteProgressBarProps) {
  if (!visible && progress === 0) {
    return null;
  }

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedProgress}
      aria-label="Route progress"
      className={cn(
        "sharek-progress-bar fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none overflow-hidden transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Animated progress indicator */}
      <div
        className="sharek-progress-bar__indicator h-full relative"
        style={{
          width: `${clampedProgress}%`,
          transition:
            clampedProgress === 100
              ? "width 120ms ease-out, opacity 250ms ease-out"
              : "width 240ms cubic-bezier(0.1, 0.5, 0.1, 1)",
          background:
            "linear-gradient(90deg, var(--brand-indigo, #2E3192), var(--evidence-teal, #2DD4BF))",
        }}
      >
        {/* Leading edge glow tip */}
        <div
          className="absolute top-0 end-0 bottom-0 w-24 opacity-90 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--evidence-teal, #2DD4BF))",
            boxShadow: "0 0 10px var(--evidence-teal, #2DD4BF), 0 0 4px var(--evidence-teal, #2DD4BF)",
          }}
        />
      </div>
    </div>
  );
}
