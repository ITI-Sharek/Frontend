import {
  ArrowUpDown,
  Check,
  Folder,
  FolderPlus,
  GripVertical,
  Info,
  Layers,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import {
  useAdminContributorFieldCategoriesQuery,
  useCreateContributorFieldCategoryMutation,
  useCreateContributorFieldMutation,
  useUpdateContributorFieldCategoryMutation,
  useUpdateContributorFieldMutation,
} from "../api/queries/use-admin-contributor-fields-query";

const INPUT_CLASS_NAME =
  "h-10 w-full rounded-input border border-border bg-input-bg px-3 text-sm text-foreground outline-none transition-colors placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary";

export function AdminContributorFieldsPanel() {
  const { t } = useTranslation();
  const categoriesQuery = useAdminContributorFieldCategoriesQuery();
  const createCategory = useCreateContributorFieldCategoryMutation();
  const updateCategory = useUpdateContributorFieldCategoryMutation();
  const createField = useCreateContributorFieldMutation();
  const updateField = useUpdateContributorFieldMutation();

  const [categoryKey, setCategoryKey] = useState("");
  const [categoryLabelAr, setCategoryLabelAr] = useState("");
  const [categoryLabelEn, setCategoryLabelEn] = useState("");

  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabelAr, setFieldLabelAr] = useState("");
  const [fieldLabelEn, setFieldLabelEn] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Drag and Drop state
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [draggedSourceCategoryId, setDraggedSourceCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  // Sort categories and fields deterministically by sortOrder (starting from 0 upwards)
  const sortedCategories = useMemo(() => {
    if (!categoriesQuery.data) return [];
    return [...categoriesQuery.data]
      .map((cat) => ({
        ...cat,
        fields: [...cat.fields].sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categoriesQuery.data]);

  const totalFieldsCount = useMemo(() => {
    return sortedCategories.reduce((acc, cat) => acc + cat.fields.length, 0);
  }, [sortedCategories]);

  useEffect(() => {
    if (
      selectedCategoryId &&
      categoriesQuery.data?.some((category) => category.id === selectedCategoryId)
    ) {
      return;
    }
    setSelectedCategoryId(categoriesQuery.data?.[0]?.id ?? "");
  }, [categoriesQuery.data, selectedCategoryId]);

  const error =
    categoriesQuery.error ??
    createCategory.error ??
    updateCategory.error ??
    createField.error ??
    updateField.error;

  const handleFieldDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    fieldId: string,
    sourceCategoryId: string,
  ) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ fieldId, sourceCategoryId }),
    );
    event.dataTransfer.effectAllowed = "move";
    setDraggedFieldId(fieldId);
    setDraggedSourceCategoryId(sourceCategoryId);
  };

  const handleFieldDragEnd = () => {
    setDraggedFieldId(null);
    setDraggedSourceCategoryId(null);
    setDragOverCategoryId(null);
    setDragOverFieldId(null);
  };

  const handleCategoryDragOver = (
    event: React.DragEvent<HTMLElement>,
    categoryId: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverCategoryId !== categoryId) {
      setDragOverCategoryId(categoryId);
    }
  };

  const handleCategoryDragLeave = (
    event: React.DragEvent<HTMLElement>,
    categoryId: string,
  ) => {
    if (
      event.currentTarget.contains(event.relatedTarget as Node) ||
      dragOverCategoryId !== categoryId
    ) {
      return;
    }
    setDragOverCategoryId(null);
  };

  const handleCategoryDrop = (
    event: React.DragEvent<HTMLElement>,
    targetCategoryId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverCategoryId(null);
    setDragOverFieldId(null);

    let droppedFieldId = draggedFieldId;
    let sourceCategoryId = draggedSourceCategoryId;

    try {
      const data = JSON.parse(event.dataTransfer.getData("application/json") || "{}") as {
        fieldId?: string;
        sourceCategoryId?: string;
      };
      if (data.fieldId) droppedFieldId = data.fieldId;
      if (data.sourceCategoryId) sourceCategoryId = data.sourceCategoryId;
    } catch {
      // fallback to state
    }

    if (!droppedFieldId) return;

    const targetCategory = sortedCategories.find((c) => c.id === targetCategoryId);
    if (!targetCategory) return;

    if (sourceCategoryId !== targetCategoryId) {
      // Moving field to a new category: calculate next sortOrder in target category
      const targetFields = targetCategory.fields;
      const nextSortOrder = targetFields.length > 0
        ? Math.max(...targetFields.map((f) => f.sortOrder)) + 10
        : 0;

      updateField.mutate({
        fieldId: droppedFieldId,
        payload: {
          categoryId: targetCategoryId,
          sortOrder: nextSortOrder,
        },
      });
    }

    setDraggedFieldId(null);
    setDraggedSourceCategoryId(null);
  };

  const handleFieldDropOnField = (
    event: React.DragEvent<HTMLDivElement>,
    targetFieldId: string,
    targetCategoryId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverCategoryId(null);
    setDragOverFieldId(null);

    let droppedFieldId = draggedFieldId;
    let sourceCategoryId = draggedSourceCategoryId;

    try {
      const data = JSON.parse(event.dataTransfer.getData("application/json") || "{}") as {
        fieldId?: string;
        sourceCategoryId?: string;
      };
      if (data.fieldId) droppedFieldId = data.fieldId;
      if (data.sourceCategoryId) sourceCategoryId = data.sourceCategoryId;
    } catch {
      // fallback
    }

    if (!droppedFieldId || droppedFieldId === targetFieldId) return;

    const targetCategory = sortedCategories.find((c) => c.id === targetCategoryId);
    if (!targetCategory) return;

    const targetFieldIndex = targetCategory.fields.findIndex((f) => f.id === targetFieldId);
    if (targetFieldIndex === -1) return;

    if (sourceCategoryId === targetCategoryId) {
      // Reordering within the same category
      const currentFields = [...targetCategory.fields];
      const draggedIndex = currentFields.findIndex((f) => f.id === droppedFieldId);
      if (draggedIndex === -1) return;

      const draggedFieldItem = currentFields[draggedIndex];
      currentFields.splice(draggedIndex, 1);
      currentFields.splice(targetFieldIndex, 0, draggedFieldItem);

      // Reassign sequential sortOrders starting with 0
      currentFields.forEach((field, index) => {
        const newOrder = index * 10;
        if (field.sortOrder !== newOrder) {
          updateField.mutate({
            fieldId: field.id,
            payload: { sortOrder: newOrder },
          });
        }
      });
    } else {
      // Moving to another category at specific index
      const targetSortOrder = targetCategory.fields[targetFieldIndex]?.sortOrder ?? 0;
      updateField.mutate({
        fieldId: droppedFieldId,
        payload: {
          categoryId: targetCategoryId,
          sortOrder: Math.max(0, targetSortOrder),
        },
      });
    }

    setDraggedFieldId(null);
    setDraggedSourceCategoryId(null);
  };

  return (
    <section
      aria-labelledby="contributor-fields-heading"
      className="mt-6 flex flex-col gap-6"
    >
      {/* Header & Stats Banner */}
      <div className="overflow-hidden rounded-card border border-border bg-card p-5 md:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-5" aria-hidden="true" />
              </span>
              <h2 id="contributor-fields-heading" className="text-xl font-bold text-foreground">
                {t("contributor.admin.contributorFieldsTitle")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("contributor.admin.contributorFieldsDescription")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-3.5 py-2 text-xs">
              <Folder className="size-4 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {categoriesQuery.isPending ? "…" : sortedCategories.length}
              </span>
              <span className="text-muted-foreground">{t("contributor.admin.totalCategories")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-3.5 py-2 text-xs">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {categoriesQuery.isPending ? "…" : totalFieldsCount}
              </span>
              <span className="text-muted-foreground">{t("contributor.admin.totalFields")}</span>
            </div>
          </div>
        </div>

        {/* Drag & Drop Tip Banner */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-foreground">
          <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{t("contributor.admin.dragDropHint")}</span>
        </div>
      </div>

      {/* Creation Forms Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form: Add Category */}
        <div className="flex flex-col justify-between overflow-hidden rounded-card border border-border bg-card p-5 md:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FolderPlus className="size-4.5 text-primary" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">
                {t("contributor.admin.categoryTitle")}
              </h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {t("contributor.admin.categoryDescription")}
            </p>

            <form
              dir="rtl"
              id="form-add-category"
              className="mt-4 flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!categoryKey.trim() || !categoryLabelAr.trim() || !categoryLabelEn.trim()) return;
                const nextSortOrder = sortedCategories.length > 0
                  ? Math.max(...sortedCategories.map((c) => c.sortOrder)) + 10
                  : 0;

                createCategory.mutate(
                  {
                    key: categoryKey.trim(),
                    labelAr: categoryLabelAr.trim(),
                    labelEn: categoryLabelEn.trim(),
                    sortOrder: nextSortOrder,
                  },
                  {
                    onSuccess: (category) => {
                      setCategoryKey("");
                      setCategoryLabelAr("");
                      setCategoryLabelEn("");
                      setSelectedCategoryId(category.id);
                    },
                  },
                );
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  {t("contributor.admin.arabicName")}
                  <input
                    dir="rtl"
                    name="categoryLabelAr"
                    autoComplete="off"
                    required
                    maxLength={100}
                    placeholder={t("contributor.admin.categoryArPlaceholder")}
                    value={categoryLabelAr}
                    onChange={(event) => setCategoryLabelAr(event.target.value)}
                    className={`${INPUT_CLASS_NAME} text-right`}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  {t("contributor.admin.englishName")}
                  <input
                    dir="ltr"
                    name="categoryLabelEn"
                    autoComplete="off"
                    required
                    maxLength={100}
                    placeholder={t("contributor.admin.categoryEnPlaceholder")}
                    value={categoryLabelEn}
                    onChange={(event) => setCategoryLabelEn(event.target.value)}
                    className={`${INPUT_CLASS_NAME} text-left font-sans`}
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                <div className="flex items-center justify-between">
                  <span>{t("contributor.admin.codeKey")}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {t("contributor.admin.keyPatternHelp")}
                  </span>
                </div>
                <input
                  dir="ltr"
                  name="categoryKey"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  maxLength={50}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title={t("contributor.admin.keyPatternHint")}
                  placeholder="software-development"
                  value={categoryKey}
                  onChange={(event) => setCategoryKey(event.target.value)}
                  className={`${INPUT_CLASS_NAME} text-left font-mono text-xs`}
                />
              </label>
            </form>
          </div>

          <div className="mt-5 pt-3 border-t border-border/50">
            <Button
              type="submit"
              form="form-add-category"
              disabled={createCategory.isPending}
              className="w-full"
            >
              {createCategory.isPending ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <FolderPlus className="size-4" aria-hidden="true" />
              )}
              {createCategory.isPending
                ? t("contributor.admin.addingCategory")
                : t("contributor.admin.addCategory")}
            </Button>
          </div>
        </div>

        {/* Form: Add Field */}
        <div className="flex flex-col justify-between overflow-hidden rounded-card border border-border bg-card p-5 md:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Plus className="size-4.5 text-primary" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">
                {t("contributor.admin.fieldTitle")}
              </h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {t("contributor.admin.fieldDescription")}
            </p>

            <form
              dir="rtl"
              id="form-add-field"
              className="mt-4 flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (
                  !selectedCategoryId ||
                  !fieldKey.trim() ||
                  !fieldLabelAr.trim() ||
                  !fieldLabelEn.trim()
                ) {
                  return;
                }

                const selectedCat = sortedCategories.find((c) => c.id === selectedCategoryId);
                const nextSortOrder = selectedCat && selectedCat.fields.length > 0
                  ? Math.max(...selectedCat.fields.map((f) => f.sortOrder)) + 10
                  : 0;

                createField.mutate(
                  {
                    categoryId: selectedCategoryId,
                    key: fieldKey.trim(),
                    labelAr: fieldLabelAr.trim(),
                    labelEn: fieldLabelEn.trim(),
                    sortOrder: nextSortOrder,
                  },
                  {
                    onSuccess: () => {
                      setFieldKey("");
                      setFieldLabelAr("");
                      setFieldLabelEn("");
                    },
                  },
                );
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5 text-xs font-semibold text-foreground sm:col-span-1">
                  {t("contributor.admin.categoryLabel")}
                  <select
                    name="fieldCategoryId"
                    autoComplete="off"
                    required
                    value={selectedCategoryId}
                    onChange={(event) => setSelectedCategoryId(event.target.value)}
                    disabled={!sortedCategories.length || createField.isPending}
                    className={`${INPUT_CLASS_NAME} text-right`}
                  >
                    <option value="">{t("contributor.admin.categorySelectPrompt")}</option>
                    {sortedCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.labelAr}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-foreground sm:col-span-1">
                  {t("contributor.admin.arabicName")}
                  <input
                    dir="rtl"
                    name="fieldLabelAr"
                    autoComplete="off"
                    required
                    maxLength={100}
                    placeholder={t("contributor.admin.fieldArPlaceholder")}
                    value={fieldLabelAr}
                    onChange={(event) => setFieldLabelAr(event.target.value)}
                    className={`${INPUT_CLASS_NAME} text-right`}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold text-foreground sm:col-span-1">
                  {t("contributor.admin.englishName")}
                  <input
                    dir="ltr"
                    name="fieldLabelEn"
                    autoComplete="off"
                    required
                    maxLength={100}
                    placeholder={t("contributor.admin.fieldEnPlaceholder")}
                    value={fieldLabelEn}
                    onChange={(event) => setFieldLabelEn(event.target.value)}
                    className={`${INPUT_CLASS_NAME} text-left font-sans`}
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                <div className="flex items-center justify-between">
                  <span>{t("contributor.admin.codeKey")}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {t("contributor.admin.keyPatternHelp")}
                  </span>
                </div>
                <input
                  dir="ltr"
                  name="fieldKey"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  maxLength={50}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title={t("contributor.admin.keyPatternHint")}
                  placeholder="react"
                  value={fieldKey}
                  onChange={(event) => setFieldKey(event.target.value)}
                  className={`${INPUT_CLASS_NAME} text-left font-mono text-xs`}
                />
              </label>
            </form>
          </div>

          <div className="mt-5 pt-3 border-t border-border/50">
            <Button
              type="submit"
              form="form-add-field"
              disabled={!selectedCategoryId || createField.isPending}
              className="w-full"
            >
              {createField.isPending ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              {createField.isPending ? t("contributor.admin.adding") : t("contributor.admin.addField")}
            </Button>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex min-w-0 items-start gap-2.5 rounded-card border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-current" />
          <span className="min-w-0 break-words font-medium">
            {getApiErrorMessage(error, t("contributor.admin.updateFieldsError"))}
          </span>
        </div>
      )}

      {/* Categories & Fields List */}
      <div className="flex flex-col gap-5">
        {categoriesQuery.isPending ? (
          <div className="flex min-h-48 items-center justify-center rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin text-primary" />
            <span>{t("contributor.admin.loadingFields")}</span>
          </div>
        ) : sortedCategories.length ? (
          sortedCategories.map((category, catIndex) => {
            const isCategoryDragOver = dragOverCategoryId === category.id;
            return (
              <article
                key={category.id}
                onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                onDragLeave={(e) => handleCategoryDragLeave(e, category.id)}
                onDrop={(e) => handleCategoryDrop(e, category.id)}
                className={`overflow-hidden rounded-card border transition-all duration-200 ${
                  isCategoryDragOver
                    ? "border-primary bg-primary/[0.04] ring-2 ring-primary/30 shadow-md"
                    : "border-border bg-card shadow-xs hover:border-border/90"
                }`}
              >
                {/* Category Header */}
                <div className="flex flex-col gap-4 border-b border-border/80 bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold font-mono text-primary">
                      {catIndex}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-foreground">{category.labelAr}</p>
                        <span className="rounded-md border border-border/60 bg-surface-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {category.labelEn} · {category.key}
                        </span>
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {t("contributor.admin.fieldsCount", { count: category.fields.length })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Controls */}
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span>{t("contributor.admin.sortOrder")}:</span>
                      <input
                        aria-label={t("contributor.admin.sortOrderAria", { name: category.labelAr })}
                        type="number"
                        min={0}
                        max={10000}
                        defaultValue={category.sortOrder}
                        disabled={updateCategory.isPending}
                        className="h-8.5 w-18 rounded-input border border-border bg-input-bg px-2 text-center text-xs font-mono text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                        onBlur={(event) => {
                          const sortOrder = Number(event.target.value);
                          if (
                            Number.isInteger(sortOrder) &&
                            sortOrder >= 0 &&
                            sortOrder <= 10000 &&
                            sortOrder !== category.sortOrder
                          ) {
                            updateCategory.mutate({ categoryId: category.id, payload: { sortOrder } });
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      aria-pressed={category.active}
                      disabled={updateCategory.isPending}
                      onClick={() =>
                        updateCategory.mutate({
                          categoryId: category.id,
                          payload: { active: !category.active },
                        })
                      }
                      className={`inline-flex h-8.5 items-center justify-center gap-1.5 rounded-input border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                        category.active
                          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border bg-surface-muted/50 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {category.active && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                      <span>{category.active ? t("contributor.admin.active") : t("contributor.admin.inactive")}</span>
                    </button>
                  </div>
                </div>

                {/* Fields Inside Category (Drag and Drop List) */}
                <div className="p-3 md:p-4">
                  {category.fields.length ? (
                    <div className="grid gap-2.5">
                      {category.fields.map((field, fieldIndex) => {
                        const isBeingDragged = draggedFieldId === field.id;
                        const isFieldDragOver = dragOverFieldId === field.id;

                        return (
                          <div
                            key={field.id}
                            draggable
                            onDragStart={(e) => handleFieldDragStart(e, field.id, category.id)}
                            onDragEnd={handleFieldDragEnd}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (dragOverFieldId !== field.id) setDragOverFieldId(field.id);
                            }}
                            onDrop={(e) => handleFieldDropOnField(e, field.id, category.id)}
                            className={`group flex flex-col gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
                              isBeingDragged
                                ? "opacity-40 border-dashed border-primary bg-primary/5"
                                : isFieldDragOver
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border/70 bg-card hover:border-border hover:bg-surface-muted/20"
                            }`}
                          >
                            {/* Field Identity & Drag Handle */}
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                title={t("contributor.admin.dragFieldHint")}
                                className="cursor-grab text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
                              >
                                <GripVertical className="size-4" aria-hidden="true" />
                              </span>

                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-mono text-muted-foreground">
                                {fieldIndex}
                              </span>

                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm leading-tight">
                                  {field.labelAr}
                                </p>
                                <p dir="ltr" className="mt-1 font-mono text-xs text-muted-foreground truncate text-left">
                                  {field.labelEn} <span className="opacity-40">·</span> {field.key}
                                </p>
                              </div>
                            </div>

                            {/* Field Controls */}
                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="text-[11px]">{t("contributor.admin.sortOrder")}:</span>
                                <input
                                  aria-label={t("contributor.admin.sortOrderAria", { name: field.labelAr })}
                                  type="number"
                                  min={0}
                                  max={10000}
                                  defaultValue={field.sortOrder}
                                  disabled={updateField.isPending}
                                  className="h-7.5 w-16 rounded-input border border-border bg-input-bg px-1.5 text-center font-mono text-xs text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                                  onBlur={(event) => {
                                    const sortOrder = Number(event.target.value);
                                    if (
                                      Number.isInteger(sortOrder) &&
                                      sortOrder >= 0 &&
                                      sortOrder <= 10000 &&
                                      sortOrder !== field.sortOrder
                                    ) {
                                      updateField.mutate({ fieldId: field.id, payload: { sortOrder } });
                                    }
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                aria-pressed={field.active}
                                disabled={updateField.isPending}
                                onClick={() =>
                                  updateField.mutate({
                                    fieldId: field.id,
                                    payload: { active: !field.active },
                                  })
                                }
                                className={`inline-flex h-7.5 items-center justify-center gap-1 rounded-input border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                                  field.active
                                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "border-border bg-surface-muted/40 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                }`}
                              >
                                {field.active && <Check className="size-3 text-primary" aria-hidden="true" />}
                                <span>{field.active ? t("contributor.admin.active") : t("contributor.admin.inactive")}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty Category Dropzone */
                    <div
                      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        isCategoryDragOver
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 bg-surface-muted/20 text-muted-foreground"
                      }`}
                    >
                      <ArrowUpDown className="size-5 opacity-70" aria-hidden="true" />
                      <p className="text-xs font-medium">
                        {isCategoryDragOver
                          ? t("contributor.admin.dropHere")
                          : t("contributor.admin.emptyCategoryDrop")}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        ) : categoriesQuery.isError ? null : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-card border border-border bg-card p-6 text-center">
            <Folder className="size-8 text-muted-foreground/60 mb-2" aria-hidden="true" />
            <p className="font-semibold text-foreground">{t("contributor.admin.noCategoriesTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("contributor.admin.noCategoriesDescription")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
