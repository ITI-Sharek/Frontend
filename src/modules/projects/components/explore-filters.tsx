import type { TFunction } from "i18next";
import { X } from "lucide-react";
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
 * WF-03 filter panel: technology (free-text, multi), category (single),
 * difficulty (single) + reset. Rendered in the desktop sidebar and the
 * mobile sheet. Technology has no backend-provided facet list (TASK-3-05
 * follow-up) — contributors type the technology name directly.
 */
export function ExploreFilters({ params, onChange, onReset }: ExploreFiltersProps) {
  const { t } = useTranslation();
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
      <FilterGroup title={t("project.filters.technology")} first>
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
            className="h-10 bg-background font-mono text-[13px] tracking-[0.65px]"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {t("project.filters.addTechnology")}
          </Button>
        </form>
        {selectedTech.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedTech.map((tech) => (
              <Button
                key={tech}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => removeTechnology(tech)}
                className="rounded-full bg-background font-mono text-[11px] tracking-[0.65px]"
              >
                <bdi>{tech}</bdi>
                <X className="size-3 text-muted-foreground" />
              </Button>
            ))}
          </div>
        )}
      </FilterGroup>

      <FilterGroup title={t("project.filters.category")}>
        <RadioGroup
          value={params.category ?? "all"}
          onValueChange={(value) => {
            const category = PROJECT_CATEGORIES.find((item) => item === value);
            onChange({ category });
          }}
        >
          <RadioOption
            value="all"
            label={t("project.filters.allCategories")}
          />
          {PROJECT_CATEGORIES.map((category) => (
            <RadioOption
              key={category}
              value={category}
              label={getCategoryLabel(t, category)}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      <FilterGroup title={t("project.filters.difficulty")}>
        <RadioGroup
          value={params.difficulty ?? "all"}
          onValueChange={(value) => {
            const difficulty = PROJECT_DIFFICULTIES.find(
              (item) => item === value,
            );
            onChange({ difficulty });
          }}
        >
          <RadioOption
            value="all"
            label={t("project.filters.anyDifficulty")}
          />
          {PROJECT_DIFFICULTIES.map((difficulty) => (
            <RadioOption
              key={difficulty}
              value={difficulty}
              label={getDifficultyLabel(t, difficulty)}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReset}
        className="mt-3 self-start"
      >
        {t("project.filters.resetFilters")}
      </Button>
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
      {/*
       * Filter group names are prose, not identifiers — they were set in the
       * mono face, which read as decoration rather than as a label.
       */}
      <legend className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function RadioOption({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1">
      <RadioGroupItem value={value} data-filter-value={value} />
      <span className="text-sm text-muted-foreground peer-data-[state=checked]:font-medium peer-data-[state=checked]:text-foreground">
        {label}
      </span>
    </label>
  );
}
