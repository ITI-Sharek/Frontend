import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export interface RouteLoadingTimingConfig {
  /** Delay in ms before Tier 1 progress bar appears (default: 90ms) */
  progressBarDelayMs?: number;
  /** Minimum duration in ms Tier 1 progress bar remains visible (default: 380ms) */
  progressBarMinVisibleMs?: number;
  /** Delay in ms before Tier 2 full veil appears (default: 320ms) */
  veilDelayMs?: number;
  /** Minimum duration in ms Tier 2 full veil remains visible (default: 620ms) */
  veilMinVisibleMs?: number;
}

export interface RouteLoadingState {
  /** True if the route is currently navigating / resolving */
  isNavigating: boolean;
  /** True when the top progress bar should be visible in the DOM */
  showProgressBar: boolean;
  /** True when the full veil overlay should be visible in the DOM */
  showVeil: boolean;
  /** Progress percentage value from 0 to 100 */
  progress: number;
}

export const ROUTE_LOADING_DEFAULTS = {
  progressBarDelayMs: 90,
  progressBarMinVisibleMs: 380,
  veilDelayMs: 320,
  veilMinVisibleMs: 620,
} as const;

/**
 * Hook providing flicker-free two-tier route transition loading state.
 *
 * Tier 1 (Progress Bar):
 * - Appears after 90ms of pending navigation.
 * - Stays visible for at least 380ms to avoid micro-flickers.
 * - Covers ordinary navigation between already loaded routes.
 *
 * Tier 2 (Full Veil):
 * - Appears after 320ms of pending navigation.
 * - Stays visible for at least 620ms to allow completion of the handoff animation cycle.
 * - Covers cold route chunks, heavy queries, and slow connections.
 */
export function useRouteLoading(
  customIsLoading?: boolean,
  config?: RouteLoadingTimingConfig
): RouteLoadingState {
  const {
    progressBarDelayMs = ROUTE_LOADING_DEFAULTS.progressBarDelayMs,
    progressBarMinVisibleMs = ROUTE_LOADING_DEFAULTS.progressBarMinVisibleMs,
    veilDelayMs = ROUTE_LOADING_DEFAULTS.veilDelayMs,
    veilMinVisibleMs = ROUTE_LOADING_DEFAULTS.veilMinVisibleMs,
  } = config ?? {};

  // Track TanStack Router navigation state
  const routerIsLoading = useRouterState({
    select: (state) => state.status === "pending" || state.isLoading,
  });

  const isNavigating = customIsLoading !== undefined ? customIsLoading : routerIsLoading;

  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showVeil, setShowVeil] = useState(false);
  const [progress, setProgress] = useState(0);

  // Keep track of timestamps when tiers become visible
  const progressBarShowTimeRef = useRef<number | null>(null);
  const veilShowTimeRef = useRef<number | null>(null);

  // Timer refs for cleanup
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const veilTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideProgressBarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideVeilTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isNavigating) {
      // Clear any pending hide timers
      if (hideProgressBarTimerRef.current) {
        clearTimeout(hideProgressBarTimerRef.current);
        hideProgressBarTimerRef.current = null;
      }
      if (hideVeilTimerRef.current) {
        clearTimeout(hideVeilTimerRef.current);
        hideVeilTimerRef.current = null;
      }

      // Initial progress kick
      setProgress((prev) => (prev > 0 && prev < 90 ? prev : 15));

      // Schedule Tier 1: Progress bar show
      if (!progressBarShowTimeRef.current) {
        progressTimerRef.current = setTimeout(() => {
          setShowProgressBar(true);
          progressBarShowTimeRef.current = Date.now();
        }, progressBarDelayMs);
      }

      // Schedule Tier 2: Full veil show
      if (!veilShowTimeRef.current) {
        veilTimerRef.current = setTimeout(() => {
          setShowVeil(true);
          veilShowTimeRef.current = Date.now();
        }, veilDelayMs);
      }

      // Simulated smooth progress progression toward 90%
      progressTickIntervalRef.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 90) return 90;
          const increment = Math.max(1, (90 - current) * 0.15);
          return Math.min(90, current + increment);
        });
      }, 120);
    } else {
      // Navigation has completed
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (veilTimerRef.current) {
        clearTimeout(veilTimerRef.current);
        veilTimerRef.current = null;
      }
      if (progressTickIntervalRef.current) {
        clearInterval(progressTickIntervalRef.current);
        progressTickIntervalRef.current = null;
      }

      // Complete progress bar immediately
      setProgress(100);

      const now = Date.now();

      // Enforce minimum display time for Tier 1 (Progress Bar)
      if (progressBarShowTimeRef.current) {
        const elapsed = now - progressBarShowTimeRef.current;
        const remaining = Math.max(0, progressBarMinVisibleMs - elapsed);

        hideProgressBarTimerRef.current = setTimeout(() => {
          setShowProgressBar(false);
          progressBarShowTimeRef.current = null;
          setProgress(0);
        }, remaining);
      } else {
        setShowProgressBar(false);
        setProgress(0);
      }

      // Enforce minimum display time for Tier 2 (Full Veil)
      if (veilShowTimeRef.current) {
        const elapsed = now - veilShowTimeRef.current;
        const remaining = Math.max(0, veilMinVisibleMs - elapsed);

        hideVeilTimerRef.current = setTimeout(() => {
          setShowVeil(false);
          veilShowTimeRef.current = null;
        }, remaining);
      } else {
        setShowVeil(false);
      }
    }

    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (veilTimerRef.current) clearTimeout(veilTimerRef.current);
      if (progressTickIntervalRef.current) clearInterval(progressTickIntervalRef.current);
      if (hideProgressBarTimerRef.current) clearTimeout(hideProgressBarTimerRef.current);
      if (hideVeilTimerRef.current) clearTimeout(hideVeilTimerRef.current);
    };
  }, [
    isNavigating,
    progressBarDelayMs,
    progressBarMinVisibleMs,
    veilDelayMs,
    veilMinVisibleMs,
  ]);

  return {
    isNavigating,
    showProgressBar,
    showVeil,
    progress,
  };
}
