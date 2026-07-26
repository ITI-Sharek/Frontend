import { X } from "lucide-react";
import { useState } from "react";

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
  params: ExploreSearchParamsDto;
  onChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
}

/**
 * WF-03 filter panel: technology (free-text, multi), category (single),
 * difficulty (single) + reset. Rendered in the desktop sidebar and the
 * mobile sheet. Technology has no backend-provided facet list (TASK-3-05
 * follow-up) — contributors type the technology name directly.
 */
export function ExploreFilters({ params, onChange, onReset }: ExploreFiltersProps) {
  const selectedTech = params.technologies ?? [];
  const [techDraft, setTechDraft] = useState("");

  function addTechnology() {
    const value = techDraft.trim();
    if (value === "") return;
    const exists = selectedTech.some(
      (tech) => tech.toLowerCase() === value.toLowerCase(),
    );
    if (!exists) {
      onChange({ technologies: [...selectedTech, value] });
    }
    setTechDraft("");
  }

  function removeTechnology(tech: string) {
    const next = selectedTech.filter((item) => item !== tech);
    onChange({ technologies: next.length > 0 ? next : undefined });
  }

  return (
    <div className="flex flex-col gap-1">
      <FilterGroup title="التقنية" first>
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            addTechnology();
          }}
        >
          <input
            value={techDraft}
            onChange={(event) => setTechDraft(event.target.value)}
            placeholder="مثال: React"
            dir="ltr"
            className="w-full rounded-input border border-border bg-background px-2.5 py-1.5 font-mono text-[13px] tracking-[0.65px] text-foreground outline-none placeholder:text-input-placeholder"
          />
          <button
            type="submit"
            className="shrink-0 rounded-input border border-border px-2.5 text-xs font-medium text-foreground hover:bg-border/20"
          >
            إضافة
          </button>
        </form>
        {selectedTech.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedTech.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => removeTechnology(tech)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-foreground"
              >
                <bdi>{tech}</bdi>
                <X className="size-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
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
