import { ChevronLeft, ChevronRight, Globe, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";

import type { GitHubAppRepositoryPageDto } from "../types/github-app.types";

interface GitHubAppRepositoryPickerProps {
  page: GitHubAppRepositoryPageDto | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
  selectedRepositoryIds: string[];
  maxSelected: number;
  onToggle: (repositoryId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/**
 * Owner-only repository picker. Repository names and visibility never leave
 * this owner surface: they are not sent to telemetry and not rendered in any
 * public profile component.
 */
export function GitHubAppRepositoryPicker({
  page,
  isLoading,
  errorMessage = null,
  selectedRepositoryIds,
  maxSelected,
  onToggle,
  currentPage,
  onPageChange,
  disabled = false,
}: GitHubAppRepositoryPickerProps) {
  const { t } = useTranslation();
  const items = page?.items ?? [];
  const atLimit = selectedRepositoryIds.length >= maxSelected;

  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">{t("githubApp.repositories.title")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("githubApp.repositories.selectedCount", { selected: selectedRepositoryIds.length, max: maxSelected })}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("githubApp.repositories.description", { max: maxSelected })}
      </p>

      {isLoading && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("githubApp.repositories.loading")}
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && items.length === 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("githubApp.repositories.empty")}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((repository) => {
            const isSelected = selectedRepositoryIds.includes(
              repository.repositoryId,
            );
            const isPrivate = repository.visibility === "private";
            const isDisabled = disabled || (!isSelected && atLimit);
            const VisibilityIcon = isPrivate ? LockKeyhole : Globe;

            return (
              <li key={repository.repositoryId}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-input border px-4 py-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/40",
                    isDisabled && "cursor-not-allowed opacity-55",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => onToggle(repository.repositoryId)}
                    aria-label={repository.fullName}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      dir="ltr"
                      className="truncate text-start font-mono text-sm text-foreground"
                    >
                      {repository.fullName}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <VisibilityIcon className="size-3.5" />
                      {isPrivate ? t("githubApp.repositories.private") : t("githubApp.repositories.public")}
                      {repository.defaultBranch && (
                        <span dir="ltr" className="font-mono">
                          · {repository.defaultBranch}
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {atLimit && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          {t("githubApp.repositories.limit", { max: maxSelected })}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronRight className="size-4" />
          {t("common.previous")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("githubApp.repositories.page", { page: currentPage })}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!page?.hasNextPage || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("common.next")}
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  );
}
