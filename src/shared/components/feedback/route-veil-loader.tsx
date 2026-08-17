import { useTranslation } from "react-i18next";
import { SharekLoader } from "./sharek-loader";
import { cn } from "@/lib/utils";

export interface RouteVeilLoaderProps {
  /** Whether the full veil is visible */
  visible: boolean;
  /** Custom loading text */
  label?: string;
  /** Optional custom class name */
  className?: string;
}

/**
 * Tier 2 Full Route Veil Loader.
 *
 * Appears after 320ms of pending route navigation.
 * Stays visible for at least 620ms to allow smooth handoff animation completion.
 * Features an 84px Sharek Handoff Loader with backdrop blur and Arabic brand mark.
 */
export function RouteVeilLoader({
  visible,
  label,
  className,
}: RouteVeilLoaderProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("common.loading", "جارٍ التحميل...");

  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={resolvedLabel}
      className={cn(
        "sharek-veil fixed inset-0 z-[9998] flex flex-col items-center justify-center",
        "bg-background/80 backdrop-blur-md transition-all duration-300",
        "animate-in fade-in duration-200",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center p-8 rounded-card border border-border/40 bg-card/60 shadow-lg backdrop-blur-sm max-w-xs text-center">
        <SharekLoader
          size="lg"
          variant="veil"
          showWordmark={true}
          showLabel={true}
          label={resolvedLabel}
        />
      </div>
    </div>
  );
}
