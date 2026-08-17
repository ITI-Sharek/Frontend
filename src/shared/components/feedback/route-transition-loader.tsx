import {
  ACTIVE_ROUTE_TRANSITION,
  useDelayedFlag,
  useIsNavigating,
} from "@/shared/hooks/use-route-loading";

import { RouteProgressBar } from "./route-progress-bar";
import { RouteVeilLoader } from "./route-veil-loader";

export interface RouteLoadingTimingConfig {
  progressBarDelayMs?: number;
  progressBarMinVisibleMs?: number;
  veilDelayMs?: number;
  veilMinVisibleMs?: number;
}

export interface RouteTransitionLoaderProps {
  isLoading?: boolean;
  timingConfig?: RouteLoadingTimingConfig;
  veilLabel?: string;
  disableProgressBar?: boolean;
  disableVeil?: boolean;
}

/**
 * Coordinates route feedback through the master branch's navigation and
 * timing hooks, while preserving the optional configuration API.
 */
export function RouteTransitionLoader({
  isLoading,
  timingConfig,
  veilLabel,
  disableProgressBar = false,
  disableVeil = false,
}: RouteTransitionLoaderProps) {
  const isNavigating = useIsNavigating();
  const loading = isLoading ?? isNavigating;
  const showProgressBar = useDelayedFlag(loading, {
    delay: timingConfig?.progressBarDelayMs ?? ACTIVE_ROUTE_TRANSITION.bar.delay,
    minDuration:
      timingConfig?.progressBarMinVisibleMs ?? ACTIVE_ROUTE_TRANSITION.bar.minDuration,
  });
  const showVeil = useDelayedFlag(loading, {
    delay: timingConfig?.veilDelayMs ?? ACTIVE_ROUTE_TRANSITION.veil.delay,
    minDuration: timingConfig?.veilMinVisibleMs ?? ACTIVE_ROUTE_TRANSITION.veil.minDuration,
  });

  return (
    <>
      {!disableProgressBar && (
        <RouteProgressBar progress={showProgressBar ? 100 : 0} visible={showProgressBar} />
      )}
      {!disableVeil && <RouteVeilLoader visible={showVeil} label={veilLabel} />}
    </>
  );
}
