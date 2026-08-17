import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/**
 * How eagerly the route transition shows itself.
 *
 * `subtle` is the everyday profile: the veil stays out of the way and only
 * covers loads a person would otherwise notice waiting through. On a local
 * machine most navigations finish inside 320ms, so it almost never appears.
 *
 * `demo` is deliberately eager. The transition is part of what is being shown,
 * so the veil fires on nearly every navigation and stays long enough to play
 * the two arcs meeting — the animation loops every 1.5s and they join at the
 * halfway point, so a 900ms floor guarantees the handoff is actually seen.
 *
 * The cost is real: `demo` adds up to ~0.9s of veil to every click, which will
 * make the app feel slower than it is. Switch ACTIVE_ROUTE_TRANSITION back to
 * `subtle` once the demo is over.
 */
export const ROUTE_TRANSITION_PROFILES = {
  demo: {
    bar: { delay: 40, minDuration: 600 },
    veil: { delay: 80, minDuration: 900 },
  },
  subtle: {
    bar: { delay: 90, minDuration: 380 },
    veil: { delay: 320, minDuration: 620 },
  },
} as const;

/** ← switch to `.subtle` after the demo. */
export const ACTIVE_ROUTE_TRANSITION = ROUTE_TRANSITION_PROFILES.demo;

/**
 * Whether the router is currently resolving a navigation.
 *
 * TanStack reports `pending` while a route's loaders run and `loading` while
 * its code chunk is fetched; either one means the reader is waiting.
 */
export function useIsNavigating(): boolean {
  return useRouterState({
    select: (state) => state.status === "pending" || state.isLoading,
  });
}

/**
 * Holds `true` only once `value` has stayed true past `delay`, then keeps it
 * true for at least `minDuration`.
 *
 * Both halves matter. Without the delay, an instant navigation flashes the
 * loader for two frames and reads as a glitch. Without the floor, a loader
 * that does appear can vanish mid-animation, which looks broken in a
 * different way. Together they mean the transition is either invisible or
 * complete — never half-played.
 */
export function useDelayedFlag(
  value: boolean,
  { delay = 180, minDuration = 520 }: { delay?: number; minDuration?: number } = {},
): boolean {
  const [visible, setVisible] = useState(false);
  /*
   * Read through a ref rather than the state value: the effect needs to know
   * whether a hide must be scheduled, but depending on `visible` would restart
   * the floor timer every time its own effect ran.
   */
  const visibleRef = useRef(false);
  visibleRef.current = visible;

  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }

    if (!visibleRef.current) return;

    const timer = setTimeout(() => setVisible(false), minDuration);
    return () => clearTimeout(timer);
  }, [value, delay, minDuration]);

  return visible;
}
