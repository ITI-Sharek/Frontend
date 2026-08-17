import { RouteProgressBar as HatemRouteProgressBar } from "./sharek-loader";

export interface RouteProgressBarProps {
  /** Current progress percentage (0 - 100). Hatem's indicator is indeterminate. */
  progress: number;
  /** Whether the progress bar is visible. */
  visible: boolean;
  /** Optional wrapper class names. */
  className?: string;
}

/**
 * Keeps the feedback component's public visibility contract while rendering
 * the master branch's indeterminate progress indicator.
 */
export function RouteProgressBar({
  progress,
  visible,
  className,
}: RouteProgressBarProps) {
  if (!visible) return null;

  return (
    <div className={className} data-progress={progress}>
      <HatemRouteProgressBar />
    </div>
  );
}
