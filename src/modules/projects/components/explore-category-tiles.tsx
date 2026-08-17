import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { getCategoryLabel, PROJECT_CATEGORIES } from "./explore-filters";
import type { ProjectCategory } from "../types/explore.types";

/**
 * Category as an illustrated tile row rather than a column of radio buttons.
 *
 * The categories are the registry's primary axis — most people arrive knowing
 * roughly what kind of project they want — but they were buried three controls
 * down a grey sidebar. Promoting them to a picture row puts the coarsest,
 * most-used filter first and turns the top of the page into something worth
 * looking at.
 *
 * Every tile is a real `<button>` driving the same `category` search param the
 * radio group drove; the sidebar radios stay for keyboard users and for the
 * mobile filter sheet, so no way of filtering was removed.
 */
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
      className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
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
        "group relative flex w-[124px] shrink-0 snap-start flex-col items-center gap-2 rounded-card border p-3 text-center",
        "transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "-translate-y-0.5 border-primary bg-primary text-primary-foreground shadow-[var(--shadow-primary)]"
          : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-raised)]",
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl transition-colors",
          selected ? "bg-white/15" : "bg-surface-fog",
        )}
      >
        {art ? (
          <img
            src={art}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            className="size-12 object-contain transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          /* "All" has no illustration; a grid of dots stands in for "any". */
          <span
            aria-hidden
            className={cn(
              "sk-dotgrid size-9 rounded-xl",
              selected && "[--texture-ink:rgba(255,255,255,0.5)]",
            )}
          />
        )}
      </span>
      <span className="text-[12.5px] font-bold leading-tight">{label}</span>
    </button>
  );
}
