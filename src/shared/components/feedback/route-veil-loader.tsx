import { useTranslation } from "react-i18next";

import { RouteTransitionVeil } from "./sharek-loader";

export interface RouteVeilLoaderProps {
  visible: boolean;
  label?: string;
  className?: string;
}

/** Renders the master branch's full-screen route transition veil. */
export function RouteVeilLoader({
  visible,
  label,
  className,
}: RouteVeilLoaderProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("common.loading", "جارٍ التحميل...");

  if (!visible) return null;

  return (
    <div aria-label={resolvedLabel} className={className}>
      <RouteTransitionVeil />
    </div>
  );
}
