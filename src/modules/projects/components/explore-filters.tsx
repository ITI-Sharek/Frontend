import type { TFunction } from "i18next";
import {
  Check,
  ChevronDown,
  Grid2X2,
  LayoutGrid,
  LayoutList,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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

export interface DynamicFilterOption {
  key: string;
  label: string;
}

export interface ExploreTopFilterBarProps {
  params: ExploreSearchParamsDto;
  onChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
  categories?: DynamicFilterOption[];
  technologies?: string[];
  difficulties?: DynamicFilterOption[];
  viewMode: "1" | "2" | "3";
  onViewModeChange: (mode: "1" | "2" | "3") => void;
  totalResults: number;
}

/**
 * Top filtration toolbar replacing the sidebar with a high-end,
 * horizontal control strip with Category, Difficulty, Tech presets,
 * and 1/2/3-Column Grid View Switcher.
 */
export function ExploreTopFilterBar({
  params,
  onChange,
  onReset,
  categories,
  technologies,
  difficulties,
  viewMode,
  onViewModeChange,
  totalResults,
}: ExploreTopFilterBarProps) {
  const { t } = useTranslation();
  const selectedTech = params.technologies ?? [];
  const [techInput, setTechInput] = useState("");
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);

  const categoryOptions = categories ?? [];

  const techPresets =
    technologies && technologies.length > 0
      ? technologies
      : POPULAR_TECHNOLOGIES;

  const difficultyOptions =
    difficulties && difficulties.length > 0
      ? difficulties
      : PROJECT_DIFFICULTIES.map((d) => ({
          key: d,
          label: getDifficultyLabel(t, d),
        }));

  const activeCategory = categoryOptions.find((c) => c.key === params.category);
  const activeDifficulty = difficultyOptions.find((d) => d.key === params.difficulty);

  const activeFiltersCount =
    (params.category ? 1 : 0) +
    (params.difficulty ? 1 : 0) +
    selectedTech.length +
    (params.q ? 1 : 0);

  function toggleTechnology(tech: string) {
    const exists = selectedTech.some(
      (item) => item.toLowerCase() === tech.toLowerCase(),
    );
    if (exists) {
      const next = selectedTech.filter(
        (item) => item.toLowerCase() !== tech.toLowerCase(),
      );
      onChange({ technologies: next.length > 0 ? next : undefined, page: undefined });
    } else {
      onChange({ technologies: [...selectedTech, tech], page: undefined });
    }
  }

  function addCustomTech() {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    const exists = selectedTech.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      onChange({ technologies: [...selectedTech, trimmed], page: undefined });
    }
    setTechInput("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-record)] space-y-4">
      {/* ── Top Row: Filter Selectors & View Mode Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 gap-2 rounded-xl px-4 text-xs sm:text-sm font-bold transition-all shadow-xs",
                  params.category
                    ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-surface-fog text-foreground hover:bg-surface-muted",
                )}
              >
                <span>
                  {activeCategory
                    ? `${t("explore.categoryFilter", "التصنيف")}: ${activeCategory.label}`
                    : t("explore.allCategories", "كل التصنيفات")}
                </span>
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1.5">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
                {t("explore.categoryFilter", "التصنيف")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                onClick={() => onChange({ category: undefined, page: undefined })}
              >
                <Check
                  className={cn(
                    "size-4 text-primary",
                    params.category === undefined ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>{t("explore.allCategories", "كل التصنيفات")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categoryOptions.map((cat) => (
                <DropdownMenuItem
                  key={cat.key}
                  className="gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                  onClick={() =>
                    onChange({
                      category: cat.key as ProjectCategory,
                      page: undefined,
                    })
                  }
                >
                  <Check
                    className={cn(
                      "size-4 text-primary",
                      params.category === cat.key ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span>{cat.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Difficulty Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 gap-2 rounded-xl px-4 text-xs sm:text-sm font-bold transition-all shadow-xs",
                  params.difficulty
                    ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-surface-fog text-foreground hover:bg-surface-muted",
                )}
              >
                {activeDifficulty && (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      activeDifficulty.key === "beginner"
                        ? "bg-emerald-500"
                        : activeDifficulty.key === "intermediate"
                          ? "bg-primary"
                          : "bg-amber-500",
                    )}
                  />
                )}
                <span>
                  {activeDifficulty
                    ? `${t("explore.difficultyFilter", "المستوى")}: ${activeDifficulty.label}`
                    : t("explore.allDifficulties", "كل المستويات")}
                </span>
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-1.5">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground">
                {t("explore.difficultyFilter", "المستوى")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                onClick={() => onChange({ difficulty: undefined, page: undefined })}
              >
                <Check
                  className={cn(
                    "size-4 text-primary",
                    params.difficulty === undefined ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>{t("explore.allDifficulties", "كل المستويات")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {difficultyOptions.map((diff) => (
                <DropdownMenuItem
                  key={diff.key}
                  className="gap-2 text-xs sm:text-sm font-semibold cursor-pointer"
                  onClick={() =>
                    onChange({
                      difficulty: diff.key as ProjectDifficulty,
                      page: undefined,
                    })
                  }
                >
                  <Check
                    className={cn(
                      "size-4 text-primary",
                      params.difficulty === diff.key ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      diff.key === "beginner"
                        ? "bg-emerald-500"
                        : diff.key === "intermediate"
                          ? "bg-primary"
                          : "bg-amber-500",
                    )}
                  />
                  <span>{diff.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Tech Filter Dropdown */}
          <DropdownMenu open={isTechDropdownOpen} onOpenChange={setIsTechDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 gap-2 rounded-xl px-4 text-xs sm:text-sm font-bold transition-all shadow-xs",
                  selectedTech.length > 0
                    ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-surface-fog text-foreground hover:bg-surface-muted",
                )}
              >
                <span>{t("explore.techFilter", "التقنيات")}</span>
                {selectedTech.length > 0 && (
                  <span className="tnum rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {selectedTech.length}
                  </span>
                )}
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-3 space-y-3">
              <DropdownMenuLabel className="p-0 text-xs font-bold text-foreground">
                {t("project.fields.technologies", "Technologies")}
              </DropdownMenuLabel>
              <form
                className="flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  addCustomTech();
                }}
              >
                <Input
                  placeholder={t("tasks.addTechPlaceholder", "+ Add tech...")}
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Button type="submit" size="sm" className="h-8 px-2.5 text-xs font-bold">
                  <Plus className="size-3" />
                </Button>
              </form>
              <div className="max-h-48 overflow-y-auto space-y-1 pt-1">
                {techPresets.map((tech) => {
                  const isSelected = selectedTech.some(
                    (item) => item.toLowerCase() === tech.toLowerCase(),
                  );
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechnology(tech)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-mono transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      <bdi>{tech}</bdi>
                      {isSelected && <Check className="size-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Action (if filters active) */}
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-10 gap-1.5 rounded-xl border border-destructive/25 bg-destructive/5 px-3 text-xs font-bold text-destructive hover:bg-destructive/15 transition-all shadow-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("explore.clearAllFilters", "مسح الكل")}</span>
            </Button>
          )}
        </div>

        {/* Right Side: Grid View Switcher (1, 2, 3 Columns) */}
        <div className="flex items-center gap-2 ms-auto">
          <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground">
            {t("explore.viewMode", "طريقة العرض")}:
          </span>
          <div className="flex items-center rounded-xl border border-border bg-surface-fog p-1 shadow-xs">
            <button
              type="button"
              onClick={() => onViewModeChange("1")}
              title={t("explore.gridView1", "1 Column")}
              aria-label={t("explore.gridView1", "1 Column")}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                viewMode === "1"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
              )}
            >
              <LayoutList className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("2")}
              title={t("explore.gridView2", "2 Columns")}
              aria-label={t("explore.gridView2", "2 Columns")}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                viewMode === "2"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
              )}
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("3")}
              title={t("explore.gridView3", "3 Columns")}
              aria-label={t("explore.gridView3", "3 Columns")}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                viewMode === "3"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Popular Tech Quick-Pills & Active Chips ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
        {/* Popular Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground me-1">
            <Sparkles className="size-3 text-evidence-teal" />
            <span>{t("tasks.quickPresets", "Popular")}:</span>
          </span>
          {techPresets.slice(0, 7).map((tech) => {
            const isSelected = selectedTech.some(
              (item) => item.toLowerCase() === tech.toLowerCase(),
            );
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTechnology(tech)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold transition-all shadow-2xs",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-foreground hover:bg-surface-muted",
                )}
              >
                {isSelected && <Check className="size-3" />}
                <bdi>{tech}</bdi>
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div className="ms-auto text-xs sm:text-sm font-bold text-foreground">
          <Trans
            i18nKey="explore.totalResults"
            count={totalResults}
            components={{
              b: <span className="tnum text-primary font-black" />,
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface ExploreFiltersProps {
  params: ExploreSearchParamsDto;
  onChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
  categories?: DynamicFilterOption[];
  technologies?: string[];
  difficulties?: DynamicFilterOption[];
}

/**
 * Mobile Sheet Filter panel.
 */
export function ExploreFilters({
  params,
  onChange,
  onReset,
  categories,
  technologies,
  difficulties,
}: ExploreFiltersProps) {
  const { t } = useTranslation();
  const selectedTech = params.technologies ?? [];
  const [techDraft, setTechDraft] = useState("");
  const categoryOptions =
    categories && categories.length > 0
      ? categories
      : PROJECT_CATEGORIES.map((c) => ({
          key: c,
          label: getCategoryLabel(t, c),
        }));

  const techPresets =
    technologies && technologies.length > 0
      ? technologies
      : POPULAR_TECHNOLOGIES;

  const difficultyOptions =
    difficulties && difficulties.length > 0
      ? difficulties
      : PROJECT_DIFFICULTIES.map((d) => ({
          key: d,
          label: getDifficultyLabel(t, d),
        }));

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
            <span>{t("tasks.quickPresets", "Popular")}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {techPresets.slice(0, 8).map((tech) => {
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
            const category = categoryOptions.find((item) => item.key === value)?.key as ProjectCategory | undefined;
            onChange({ category: value === "all" ? undefined : category });
          }}
          className="gap-1"
        >
          <RadioOption
            value="all"
            label={t("project.filters.allCategories")}
            isSelected={params.category === undefined}
          />
          {categoryOptions.map((cat) => (
            <RadioOption
              key={cat.key}
              value={cat.key}
              label={cat.label}
              isSelected={params.category === cat.key}
            />
          ))}
        </RadioGroup>
      </FilterGroup>

      {/* 3. Difficulty Filters */}
      <FilterGroup title={t("project.filters.difficulty")}>
        <RadioGroup
          value={params.difficulty ?? "all"}
          onValueChange={(value) => {
            const difficulty = difficultyOptions.find((item) => item.key === value)?.key as ProjectDifficulty | undefined;
            onChange({ difficulty: value === "all" ? undefined : difficulty });
          }}
          className="gap-1"
        >
          <RadioOption
            value="all"
            label={t("project.filters.anyDifficulty")}
            isSelected={params.difficulty === undefined}
          />
          {difficultyOptions.map((diff) => (
            <RadioOption
              key={diff.key}
              value={diff.key}
              label={diff.label}
              isSelected={params.difficulty === diff.key}
              dotColor={
                diff.key === "beginner"
                  ? "bg-evidence-teal"
                  : diff.key === "intermediate"
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
