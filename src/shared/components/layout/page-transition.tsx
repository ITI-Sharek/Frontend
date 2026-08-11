import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { pageVariants } from "@/shared/lib/motion";

interface PageTransitionProps {
  /** Pass the current route pathname as the key so AnimatePresence
   *  triggers enter/exit whenever the route changes. */
  routeKey: string;
  children: ReactNode;
}

/**
 * Wraps page content with a subtle fade + settle entrance animation.
 * Mount this once around the <Outlet /> in each layout.
 *
 * The animation is intentionally short (220ms) and the vertical travel
 * is tiny (5px) — enough to feel polished without slowing navigation.
 *
 * prefers-reduced-motion is handled globally in styles.css via
 * `transition-duration: 0.01ms` on * — Framer Motion respects this
 * because it uses CSS transitions/animations under the hood for opacity.
 */
export function PageTransition({ routeKey, children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        // Ensure full width so the wrapper never clips content
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
