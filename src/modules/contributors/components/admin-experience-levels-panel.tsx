import { Award, Check, Loader2, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import {
  useAdminExperienceLevelsQuery,
  useCreateExperienceLevelMutation,
  useUpdateExperienceLevelMutation,
} from "../api/queries/use-admin-experience-levels-query";

export function AdminExperienceLevelsPanel() {
  const { t } = useTranslation();
  const levelsQuery = useAdminExperienceLevelsQuery();
  const createLevel = useCreateExperienceLevelMutation();
  const updateLevel = useUpdateExperienceLevelMutation();

  const [key, setKey] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [labelEn, setLabelEn] = useState("");

  // Sort levels deterministically by sortOrder (starting from 0 upwards)
  const sortedLevels = useMemo(() => {
    if (!levelsQuery.data) return [];
    return [...levelsQuery.data].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }, [levelsQuery.data]);

  const error = levelsQuery.error ?? createLevel.error ?? updateLevel.error;

  return (
    <section
      aria-labelledby="experience-levels-heading"
      className="mt-6 flex flex-col gap-6"
    >
      {/* Header & Stats Banner */}
      <div className="overflow-hidden rounded-card border border-border bg-card p-5 md:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="size-5" aria-hidden="true" />
              </span>
              <h2 id="experience-levels-heading" className="text-xl font-bold text-foreground">
                {t("contributor.admin.experienceLevelsTitle")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("contributor.admin.experienceLevelsDescription")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-3.5 py-2 text-xs">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {levelsQuery.isPending ? "…" : sortedLevels.length}
              </span>
              <span className="text-muted-foreground">{t("contributor.admin.totalLevels")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form: Add Experience Level */}
      <div className="overflow-hidden rounded-card border border-border bg-card p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Plus className="size-4.5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">
            {t("contributor.admin.addLevel")}
          </h3>
        </div>

        <form
          dir="rtl"
          className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            if (!key.trim() || !labelAr.trim() || !labelEn.trim()) return;

            const nextSortOrder = sortedLevels.length > 0
              ? Math.max(...sortedLevels.map((l) => l.sortOrder)) + 10
              : 0;

            createLevel.mutate(
              {
                key: key.trim(),
                labelAr: labelAr.trim(),
                labelEn: labelEn.trim(),
                sortOrder: nextSortOrder,
              },
              {
                onSuccess: () => {
                  setKey("");
                  setLabelAr("");
                  setLabelEn("");
                },
              },
            );
          }}
        >
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            {t("contributor.admin.arabicName")}
            <Input
              dir="rtl"
              name="experienceLabelAr"
              autoComplete="off"
              required
              maxLength={100}
              placeholder={t("contributor.admin.levelArPlaceholder")}
              value={labelAr}
              onChange={(event) => setLabelAr(event.target.value)}
              className="h-10 text-right"
            />
          </label>

          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            {t("contributor.admin.englishName")}
            <Input
              dir="ltr"
              name="experienceLabelEn"
              autoComplete="off"
              required
              maxLength={100}
              placeholder={t("contributor.admin.levelEnPlaceholder")}
              value={labelEn}
              onChange={(event) => setLabelEn(event.target.value)}
              className="h-10 text-left font-sans"
            />
          </label>

          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            <div className="flex items-center justify-between">
              <span>{t("contributor.admin.codeKey")}</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                {t("contributor.admin.keyPatternHelp")}
              </span>
            </div>
            <Input
              dir="ltr"
              name="levelKey"
              autoComplete="off"
              spellCheck={false}
              required
              maxLength={50}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              title={t("contributor.admin.keyPatternHint")}
              placeholder="two-to-four"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              className="h-10 text-left font-mono text-xs"
            />
          </label>

          <Button
            type="submit"
            disabled={createLevel.isPending}
            className="w-full xl:w-auto h-10"
          >
            {createLevel.isPending ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {createLevel.isPending
              ? t("contributor.admin.adding")
              : t("contributor.admin.addLevel")}
          </Button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex min-w-0 items-start gap-2.5 rounded-card border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-current" />
          <span className="min-w-0 break-words font-medium">
            {getApiErrorMessage(error, t("contributor.admin.updateLevelsError"))}
          </span>
        </div>
      )}

      {/* Levels List */}
      <div className="overflow-hidden rounded-card border border-border bg-card shadow-xs">
        <div className="divide-y divide-border/80">
          {levelsQuery.isPending ? (
            <div className="flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin text-primary" />
              <span>{t("contributor.admin.loadingLevels")}</span>
            </div>
          ) : sortedLevels.length ? (
            sortedLevels.map((level, index) => (
              <div
                key={level.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-muted/20 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4"
              >
                {/* Level Details */}
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold font-mono text-primary">
                    {index}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-foreground">{level.labelAr}</p>
                      <span className="rounded-md border border-border/60 bg-surface-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {level.labelEn} · {level.key}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Level Controls */}
                <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span>{t("contributor.admin.sortOrder")}:</span>
                    <Input
                      aria-label={t("contributor.admin.sortOrderAria", { name: level.labelAr })}
                      type="number"
                      min={0}
                      max={10000}
                      defaultValue={level.sortOrder}
                      disabled={updateLevel.isPending}
                      className="h-8.5 w-18 px-2 text-center font-mono text-xs"
                      onBlur={(event) => {
                        const sortOrder = Number(event.target.value);
                        if (
                          Number.isInteger(sortOrder) &&
                          sortOrder >= 0 &&
                          sortOrder <= 10000 &&
                          sortOrder !== level.sortOrder
                        ) {
                          updateLevel.mutate({ levelId: level.id, payload: { sortOrder } });
                        }
                      }}
                    />
                  </label>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-pressed={level.active}
                    disabled={updateLevel.isPending}
                    onClick={() =>
                      updateLevel.mutate({
                        levelId: level.id,
                        payload: { active: !level.active },
                      })
                    }
                    className={`h-8.5 ${
                      level.active
                        ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-border bg-surface-muted/50 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    {level.active && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                    <span>{level.active ? t("contributor.admin.active") : t("contributor.admin.inactive")}</span>
                  </Button>
                </div>
              </div>
            ))
          ) : levelsQuery.isError ? null : (
            <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
              <Award className="size-8 text-muted-foreground/60 mb-2" aria-hidden="true" />
              <p className="font-semibold text-foreground">{t("contributor.admin.noLevelsTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("contributor.admin.noLevelsDescription")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
