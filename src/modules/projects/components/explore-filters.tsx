import { cn } from "@/lib/utils";

import type {
  ExploreSearchParamsDto,
  ProjectCategory,
  ProjectDifficulty,
} from "../types/explore.types";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web: "ويب",
  mobile: "موبايل",
  ai_ml: "ذكاء اصطناعي",
  devops: "DevOps",
  tools_utilities: "أدوات",
};

export const DIFFICULTY_LABELS: Record<ProjectDifficulty, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as ProjectDifficulty[];

interface ExploreFiltersProps {
  technologyFacets: string[];
  params: ExploreSearchParamsDto;
  onChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
}

/**
 * WF-03 filter panel: technology (multi), category (single), difficulty
 * (single) + reset. Rendered in the desktop sidebar and the mobile sheet.
 */
export function ExploreFilters({
  technologyFacets,
  params,
  onChange,
  onReset,
}: ExploreFiltersProps) {
  const selectedTech = params.technologies ?? [];

  function toggleTechnology(tech: string) {
    const next = selectedTech.includes(tech)
      ? selectedTech.filter((item) => item !== tech)
      : [...selectedTech, tech];
    onChange({ technologies: next.length > 0 ? next : undefined });
  }

  return (
    <div className="flex flex-col gap-1">
      <FilterGroup title="التقنية" first>
        {technologyFacets.map((tech) => {
          const checked = selectedTech.includes(tech);
          return (
            <label key={tech} className="flex cursor-pointer items-center gap-2.5 py-1">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTechnology(tech)}
                className="size-4 accent-[var(--primary)]"
              />
              <span
                dir="ltr"
                className={cn(
                  "font-mono text-[13px] tracking-[0.65px]",
                  checked ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {tech}
              </span>
            </label>
          );
        })}
      </FilterGroup>

      <FilterGroup title="التصنيف">
        <RadioOption
          label="الكل"
          checked={params.category === undefined}
          onSelect={() => onChange({ category: undefined })}
        />
        {CATEGORIES.map((category) => (
          <RadioOption
            key={category}
            label={CATEGORY_LABELS[category]}
            checked={params.category === category}
            onSelect={() => onChange({ category })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="مستوى الصعوبة">
        <RadioOption
          label="أي مستوى"
          checked={params.difficulty === undefined}
          onSelect={() => onChange({ difficulty: undefined })}
        />
        {DIFFICULTIES.map((difficulty) => (
          <RadioOption
            key={difficulty}
            label={DIFFICULTY_LABELS[difficulty]}
            checked={params.difficulty === difficulty}
            onSelect={() => onChange({ difficulty })}
          />
        ))}
      </FilterGroup>

      <button
        type="button"
        onClick={onReset}
        className="mt-3 self-start rounded-input border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border/20"
      >
        إعادة تعيين الفلاتر
      </button>
    </div>
  );
}

function FilterGroup({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("py-4", !first && "border-t border-border")}>
      <legend className="mb-2 font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function RadioOption({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1">
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="size-4 accent-[var(--primary)]"
      />
      <span
        className={cn(
          "text-sm",
          checked ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </label>
  );
}
