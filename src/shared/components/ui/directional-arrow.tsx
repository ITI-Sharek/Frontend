import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * A "keep going" arrow that points the way the reader is travelling.
 *
 * The product was built Arabic-first, so the codebase reached for `ArrowLeft`
 * whenever it meant *forward* — correct under RTL, backwards under the English
 * layout, where every "Review details →" affordance ended up pointing back at
 * the text it came from. This resolves the glyph from the active language
 * instead of hard-coding a side.
 *
 * Use `direction="back"` for genuine back-navigation, which flips the same way.
 */
export function DirectionalArrow({
  className,
  direction = "forward",
  variant = "arrow",
}: {
  className?: string;
  direction?: "forward" | "back";
  variant?: "arrow" | "chevron";
}) {
  const { i18n } = useTranslation();
  const isRtl = !i18n.language.startsWith("en");
  const pointsStart = direction === "forward" ? isRtl : !isRtl;

  const Icon =
    variant === "chevron"
      ? pointsStart
        ? ChevronLeft
        : ChevronRight
      : pointsStart
        ? ArrowLeft
        : ArrowRight;

  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
}
