import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { getCategoryLabel, PROJECT_CATEGORIES } from "./explore-filters";
import type { ProjectCategory } from "../types/explore.types";

const CATEGORY_ART: Record<ProjectCategory, string> = {
  web: "/art/cat-web.png",
  mobile: "/art/cat-mobile.png",
  ai_ml: "/art/cat-ai.png",
  devops: "/art/cat-devops.png",
  tools_utilities: "/art/cat-tools.png",
};

export function ExploreCategoryTiles({
  active,
  onSelect,
}: {
  active: ProjectCategory | undefined;
  onSelect: (category: ProjectCategory | undefined) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={t("project.filters.category")}
    >
      <CategoryTile
        label={t("project.filters.allCategories")}
        selected={active === undefined}
        onClick={() => onSelect(undefined)}
      />
      {PROJECT_CATEGORIES.map((category) => (
        <CategoryTile
          key={category}
          label={getCategoryLabel(t, category)}
          art={CATEGORY_ART[category]}
          selected={active === category}
          onClick={() => onSelect(active === category ? undefined : category)}
        />
      ))}
    </div>
  );
}

function CategoryTile({
  label,
  art,
  selected,
  onClick,
}: {
  label: string;
  art?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-[130px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-card border p-3.5 text-center sm:w-[140px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "-translate-y-1 border-primary bg-primary text-primary-foreground shadow-[var(--shadow-primary)] ring-1 ring-primary/50"
          : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-raised)]",
      )}
    >
      {/* Visual icon/art box */}
      <span
        className={cn(
          "relative flex size-14 items-center justify-center rounded-2xl transition-all duration-200",
          selected
            ? "bg-white/15 shadow-inner"
            : "bg-surface-fog group-hover:bg-surface-muted",
        )}
      >
        {art ? (
          <img
            src={art}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="size-11 object-contain transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          <Layers
            className={cn(
              "size-6 transition-transform duration-200 group-hover:scale-110",
              selected ? "text-white" : "text-primary",
            )}
            aria-hidden
          />
        )}
      </span>

      <span className="text-[13px] font-bold leading-tight line-clamp-1">
        {label}
      </span>
    </button>
  );
}
