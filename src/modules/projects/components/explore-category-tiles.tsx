import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { ProjectCategory } from "../types/explore.types";

const CATEGORY_ART: Record<ProjectCategory, string> = {
  web: "/art/cat-web.png",
  mobile: "/art/cat-mobile.png",
  ai_ml: "/art/cat-ai.png",
  devops: "/art/cat-devops.png",
  tools_utilities: "/art/cat-tools.png",
};

export interface ExploreCategoryTileOption {
  key: ProjectCategory | string;
  label: string;
  art?: string;
}

export function ExploreCategoryTiles({
  active,
  onSelect,
  categories,
}: {
  active: ProjectCategory | undefined;
  onSelect: (category: ProjectCategory | undefined) => void;
  categories?: ExploreCategoryTileOption[];
}) {
  const { t } = useTranslation();

  const items = categories ?? [];

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
      {items.map((cat) => {
        const art =
          cat.art ??
          (cat.key in CATEGORY_ART
            ? CATEGORY_ART[cat.key as ProjectCategory]
            : "/art/cat-tools.png");
        return (
          <CategoryTile
            key={cat.key}
            label={cat.label}
            art={art}
            selected={active === cat.key}
            onClick={() =>
              onSelect(
                active === cat.key ? undefined : (cat.key as ProjectCategory),
              )
            }
          />
        );
      })}
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
        "group relative flex w-[140px] shrink-0 snap-start flex-col items-center gap-3 rounded-2xl border p-4 text-center sm:w-[155px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "-translate-y-0.5 border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50",
      )}
    >
      {/* Flat clean white box with large, readable image */}
      <span
        className={cn(
          "relative flex size-18 sm:size-20 items-center justify-center rounded-2xl bg-white transition-all duration-200 dark:bg-card",
        )}
      >
        {art ? (
          <img
            src={art}
            alt=""
            width={80}
            height={80}
            loading="lazy"
            className="size-15 sm:size-17 object-contain transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          <Layers
            className="size-9 text-primary transition-transform duration-200 group-hover:scale-110"
            aria-hidden
          />
        )}
      </span>

      <span className="text-sm font-extrabold leading-tight line-clamp-1">
        {label}
      </span>
    </button>
  );
}
