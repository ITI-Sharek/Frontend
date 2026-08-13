/**
 * Shared motion system — reusable Framer Motion variants and transition presets.
 *
 * Philosophy: subtle, fast, natural. Animations support UX rather than
 * decorating it. All variants respect prefers-reduced-motion through the
 * global CSS override in styles.css (transition-duration: 0.01ms).
 *
 * Duration tiers:
 *   fast   → 120ms  (tooltips, badges, tiny state changes)
 *   normal → 200ms  (dropdowns, page content entrance)
 *   slow   → 320ms  (page transitions, modals)
 */

import type { Easing, Transition, Variants } from "framer-motion";

// ─── Easing constants (typed for Framer Motion v12) ────────────────────────────

export const ease = {
  out: "easeOut" as Easing,
  in: "easeIn" as Easing,
  inOut: "easeInOut" as Easing,
  // A natural deceleration curve — slightly snappier than easeOut
  smooth: [0.25, 0.46, 0.45, 0.94] as Easing,
} as const;

// ─── Transition presets ────────────────────────────────────────────────────────

export const transition = {
  fast: { duration: 0.12, ease: ease.out } satisfies Transition,
  normal: { duration: 0.2, ease: ease.smooth } satisfies Transition,
  slow: { duration: 0.32, ease: ease.smooth } satisfies Transition,
  spring: { type: "spring", stiffness: 320, damping: 32, mass: 0.9 } satisfies Transition,
  springSnappy: { type: "spring", stiffness: 400, damping: 36, mass: 0.8 } satisfies Transition,
} as const;

// ─── Fade variants ─────────────────────────────────────────────────────────────

/** Simple opacity fade — for modals backdrops, plan chips, etc. */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.normal },
  exit: { opacity: 0, transition: transition.fast },
};

// ─── Page / content entrance ───────────────────────────────────────────────────

/**
 * Subtle fade + lift used as the single page-transition wrapper.
 * translateY is intentionally tiny (5px) so it feels like "settling in"
 * rather than "flying up."
 */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transition.normal, duration: 0.22 },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: transition.fast,
  },
};

// ─── Dropdown / popover ────────────────────────────────────────────────────────

/**
 * Used for menus, dropdowns, popovers — a small origin-top scale + fade.
 * The transform-origin should be set via CSS on the container.
 */
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: transition.fast,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...transition.normal, duration: 0.15 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: transition.fast,
  },
};

// ─── Modal / dialog ────────────────────────────────────────────────────────────

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.normal },
  exit: { opacity: 0, transition: transition.fast },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...transition.normal, duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: transition.fast,
  },
};

// ─── Toast / notification ──────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: transition.fast,
  },
};

// ─── Stagger container ─────────────────────────────────────────────────────────

/**
 * Wrap a list of items in this container and each child uses `staggerItem`.
 * Stagger is kept very short (30ms) so content appears instantly.
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
};

// ─── Label / text slide ────────────────────────────────────────────────────────

/** Used inside sidebar for label show/hide on collapse (already in app-shell). */
export const labelVariants: Variants = {
  visible: { opacity: 1, x: 0, transition: transition.normal },
  hidden: { opacity: 0, x: 8, transition: transition.fast },
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, x: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { ...transition.fast, duration: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    x: -4,
    transition: transition.fast,
  },
};
