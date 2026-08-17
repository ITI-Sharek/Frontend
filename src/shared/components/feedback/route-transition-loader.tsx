import { RouteProgressBar } from "./route-progress-bar";
import { RouteVeilLoader } from "./route-veil-loader";
import { useRouteLoading } from "@/shared/hooks/use-route-loading";
import type { RouteLoadingTimingConfig } from "@/shared/hooks/use-route-loading";

export interface RouteTransitionLoaderProps {
  /** Optional custom override for loading state */
  isLoading?: boolean;
  /** Custom timing configuration for Tier 1 and Tier 2 delays/durations */
  timingConfig?: RouteLoadingTimingConfig;
  /** Custom text to display on the veil */
  veilLabel?: string;
  /** Whether to disable the Tier 1 top progress bar */
  disableProgressBar?: boolean;
  /** Whether to disable the Tier 2 full veil */
  disableVeil?: boolean;
}

/**
 * RouteTransitionLoader
 *
 * Coordinates the two-tier route navigation feedback:
 * 1. Tier 1: Top progress bar appears after 90ms, visible for at least 380ms.
 * 2. Tier 2: Full screen veil appears after 320ms, visible for at least 620ms.
 *
 * Automatically connects to TanStack Router transition state when placed in the root tree.
 */
export function RouteTransitionLoader({
  isLoading,
  timingConfig,
  veilLabel,
  disableProgressBar = false,
  disableVeil = false,
}: RouteTransitionLoaderProps) {
  const { showProgressBar, showVeil, progress } = useRouteLoading(
    isLoading,
    timingConfig
  );

  return (
    <>
      {!disableProgressBar && (
        <RouteProgressBar progress={progress} visible={showProgressBar} />
      )}
      {!disableVeil && (
        <RouteVeilLoader visible={showVeil} label={veilLabel} />
      )}
    </>
  );
}
