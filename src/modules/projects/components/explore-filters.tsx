import type { TFunction } from "i18next";
import { Check, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";

import type {
  ExploreSearchParamsDto,
  ProjectCategory,
  ProjectDifficulty,
} from "../types/explore.types";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "web",
  "mobile",
  "ai_ml",
  "devops",
  "tools_utilities",
];

export const PROJECT_DIFFICULTIES: ProjectDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const POPULAR_TECHNOLOGIES: string[] = [
  "TypeScript",
  "React",
  "Python",
  "Node.js",
  "Next.js",
  "Go",
  "Rust",
  "Docker",
  "PostgreSQL",
  "TailwindCSS",
];

export function getCategoryLabel(
  t: TFunction,
  category: ProjectCategory,
): string {
  return t(`project.category.${category}`);
}

export function getDifficultyLabel(
  t: TFunction,
  difficulty: ProjectDifficulty,
): string {
  return t(`project.difficulty.${difficulty}`);
}

interface ExploreFiltersProps {
  params: ExploreSearchParamsDto;
  onChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
}

/**
 * WF-03 filter panel: technology (free-text + quick presets, multi-select),
 * category (single-select), difficulty (single-select) + reset.
 * Maintained in the desktop sticky sidebar and mobile slide-over sheet.
 */
export function ExploreFilters({
  params,
  onChange,
  onReset,
}: ExploreFiltersProps) {
  const { t } = useTranslation();
  const selectedTech = params.technologies ?? [];
  const [techDraft, setTechDraft] = useState("");

  const hasActiveFilters =
    selectedTech.length > 0 ||
    params.category !== undefined ||
    params.difficulty !== undefined ||
    Boolean(params.q);

  function toggleTechnology(tech: string) {
    const exists = selectedTech.some(
      (item) => item.toLowerCase() === tech.toLowerCase(),
    );
    if (exists) {
      const next = selectedTech.filter(
        (item) => item.toLowerCase() !== tech.toLowerCase(),
      );
      onChange({ technologies: next.length > 0 ? next : undefined });
    } else {
      onChange({ technologies: [...selectedTech, tech] });
    }
  }

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
    <div className="flex flex-col gap-5">
      {/* 1. Technology Filters */}
      <FilterGroup title={t("project.filters.technology")}>
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            addTechnology();
          }}
        >
          <Input
            value={techDraft}
            onChange={(event) => setTechDraft(event.target.value)}
            placeholder={t("project.filters.technologyPlaceholder")}
            dir="ltr"
            className="h-9.5 bg-background font-mono text-[13px] tracking-wide"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="h-9.5 shrink-0 px-3"
          >
            <Plus className="size-3.5" />
            <span>{t("project.filters.addTechnology")}</span>
          </Button>
        </form>

        {/* Selected custom tags */}
        {selectedTech.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {selectedTech.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => removeTechnology(tech)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 font-mono text-[11px] font-medium text-primary-soft-foreground transition-colors hover:border-destructive/40 hover:bg-destructive-soft hover:text-destructive"
              >
                <bdi>{tech}</bdi>
                <X className="size-3" />
              </button>
            ))}
          </div>
        )}

        {/* Popular Presets */}
        <div className="mt-3">
          <p className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-subtle-foreground">
            <Sparkles className="size-3 text-evidence-teal" />
            <span>{t("tasks.quickPresets", "شائع")}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {POPULAR_TECHNOLOGIES.slice(0, 6).map((tech) => {
              const isSelected = selectedTech.some(
                (item) => item.toLowerCase() === tech.toLowerCase(),
              );
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTechnology(tech)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {isSelected && <Check className="size-2.5" />}
                  <bdi>{tech}</bdi>
                </button>
              );
            })}
          </div>
        </div>
      </FilterGroup>

      {/* 2. Category Filters */}
      <FilterGroup title={t("project.filters.category")}>
        <RadioGroup
          value={params.category ?? "all"}
          onValueChange={(value) => {
            const category = PROJECT_CATEGORIES.find((item) => item === value);
            onChange({ category });
          }}
          className="gap-1"
        >
          <RadioOption
            value="all"
            label={t("project.filters.allCategories")}
            isSelected={params.category === undefined}
          />
          {PROJECT_CATEGORIES.map((category) => (
            <RadioOption
              key={category}
              value={category}
              label={getCategoryLabel(t, category)}
              isSelected={params.category === category}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* 3. Difficulty Filters */}
      <FilterGroup title={t("project.filters.difficulty")}>
        <RadioGroup
          value={params.difficulty ?? "all"}
          onValueChange={(value) => {
            const difficulty = PROJECT_DIFFICULTIES.find(
              (item) => item === value,
            );
            onChange({ difficulty });
          }}
          className="gap-1"
        >
          <RadioOption
            value="all"
            label={t("project.filters.anyDifficulty")}
            isSelected={params.difficulty === undefined}
          />
          {PROJECT_DIFFICULTIES.map((difficulty) => (
            <RadioOption
              key={difficulty}
              value={difficulty}
              label={getDifficultyLabel(t, difficulty)}
              isSelected={params.difficulty === difficulty}
              dotColor={
                difficulty === "beginner"
                  ? "bg-evidence-teal"
                  : difficulty === "intermediate"
                    ? "bg-primary"
                    : "bg-review-amber"
              }
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* Reset Action */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!hasActiveFilters}
        onClick={onReset}
        className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <RotateCcw className="size-3.5" />
        <span>{t("project.filters.resetFilters")}</span>
      </Button>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function RadioOption({
  label,
  value,
  isSelected,
  dotColor,
}: {
  label: string;
  value: string;
  isSelected: boolean;
  dotColor?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all",
        isSelected
          ? "border-primary/40 bg-primary-soft/50 font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-2.5">
        <RadioGroupItem
          value={value}
          data-filter-value={value}
          className="size-4"
        />
        <span className="text-[13px]">{label}</span>
      </div>
      {dotColor && (
        <span
          className={cn("size-2 shrink-0 rounded-full", dotColor)}
          aria-hidden
        />
      )}
    </label>
  );
}
