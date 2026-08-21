import {
  Award,
  CheckCircle2,
  FolderPlus,
  Layers,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useAdminContributorFieldCategoriesQuery,
  useCreateContributorFieldCategoryMutation,
  useCreateContributorFieldMutation,
  useAdminExperienceLevelsQuery,
  useCreateExperienceLevelMutation,
} from "@/modules/contributors";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

export type QuickCreateTab = "category" | "field" | "level";

interface AdminQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: QuickCreateTab;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-");
}

export function AdminQuickCreateDialog({
  open,
  onOpenChange,
  initialTab = "category",
}: AdminQuickCreateDialogProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [activeTab, setActiveTab] = useState<QuickCreateTab>(initialTab);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states for Category
  const [categoryKey, setCategoryKey] = useState("");
  const [categoryLabelAr, setCategoryLabelAr] = useState("");
  const [categoryLabelEn, setCategoryLabelEn] = useState("");
  const [isCategoryKeyManuallyEdited, setIsCategoryKeyManuallyEdited] = useState(false);

  // Form states for Field
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabelAr, setFieldLabelAr] = useState("");
  const [fieldLabelEn, setFieldLabelEn] = useState("");
  const [isFieldKeyManuallyEdited, setIsFieldKeyManuallyEdited] = useState(false);

  // Form states for Level
  const [levelKey, setLevelKey] = useState("");
  const [levelLabelAr, setLabelAr] = useState("");
  const [levelLabelEn, setLabelEn] = useState("");
  const [levelSortOrder, setLevelSortOrder] = useState<number | undefined>(undefined);
  const [isLevelKeyManuallyEdited, setIsLevelKeyManuallyEdited] = useState(false);

  const categoriesQuery = useAdminContributorFieldCategoriesQuery();
  const levelsQuery = useAdminExperienceLevelsQuery();

  const createCategory = useCreateContributorFieldCategoryMutation();
  const createField = useCreateContributorFieldMutation();
  const createLevel = useCreateExperienceLevelMutation();

  const isSubmitting =
    createCategory.isPending || createField.isPending || createLevel.isPending;

  const currentError =
    createCategory.error || createField.error || createLevel.error;

  const categories = categoriesQuery.data ?? [];
  const effectiveCategoryId =
    selectedCategoryId || (categories.length > 0 ? categories[0].id : "");

  function handleTabChange(tab: QuickCreateTab) {
    setActiveTab(tab);
    setSuccessMessage(null);
  }

  function handleResetForms() {
    setCategoryKey("");
    setCategoryLabelAr("");
    setCategoryLabelEn("");
    setIsCategoryKeyManuallyEdited(false);

    setFieldKey("");
    setFieldLabelAr("");
    setFieldLabelEn("");
    setIsFieldKeyManuallyEdited(false);

    setLevelKey("");
    setLabelAr("");
    setLabelEn("");
    setLevelSortOrder(undefined);
    setIsLevelKeyManuallyEdited(false);
  }

  async function handleSubmitCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryKey.trim() || !categoryLabelAr.trim() || !categoryLabelEn.trim()) return;

    try {
      await createCategory.mutateAsync({
        key: categoryKey.trim(),
        labelAr: categoryLabelAr.trim(),
        labelEn: categoryLabelEn.trim(),
        sortOrder: categories.length * 10,
      });
      setSuccessMessage(t("admin.dashboard.quickCreate.successMessage", "Created successfully!"));
      handleResetForms();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch {
      // Handled by mutation error state
    }
  }

  async function handleSubmitField(e: React.FormEvent) {
    e.preventDefault();
    if (
      !effectiveCategoryId ||
      !fieldKey.trim() ||
      !fieldLabelAr.trim() ||
      !fieldLabelEn.trim()
    ) {
      return;
    }

    try {
      await createField.mutateAsync({
        categoryId: effectiveCategoryId,
        key: fieldKey.trim(),
        labelAr: fieldLabelAr.trim(),
        labelEn: fieldLabelEn.trim(),
      });
      setSuccessMessage(t("admin.dashboard.quickCreate.successMessage", "Created successfully!"));
      handleResetForms();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch {
      // Handled by mutation error state
    }
  }

  async function handleSubmitLevel(e: React.FormEvent) {
    e.preventDefault();
    if (!levelKey.trim() || !levelLabelAr.trim() || !levelLabelEn.trim()) return;

    const existingLevels = levelsQuery.data ?? [];
    const nextOrder =
      levelSortOrder ??
      (existingLevels.length > 0
        ? Math.max(...existingLevels.map((l) => l.sortOrder)) + 10
        : 0);

    try {
      await createLevel.mutateAsync({
        key: levelKey.trim(),
        labelAr: levelLabelAr.trim(),
        labelEn: levelLabelEn.trim(),
        sortOrder: nextOrder,
      });
      setSuccessMessage(t("admin.dashboard.quickCreate.successMessage", "Created successfully!"));
      handleResetForms();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch {
      // Handled by mutation error state
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {t("admin.dashboard.quickCreate.title", "Quick Create")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t(
                  "admin.dashboard.quickCreate.description",
                  "Quickly create taxonomy items or experience levels without leaving the dashboard.",
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="mt-4 flex rounded-2xl border border-border/80 bg-surface-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleTabChange("category")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
              activeTab === "category"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderPlus className="size-3.5 text-primary" />
            <span>{t("admin.dashboard.quickCreate.tabCategory", "Category")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("field")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
              activeTab === "field"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5 text-primary" />
            <span>{t("admin.dashboard.quickCreate.tabField", "Field")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("level")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
              activeTab === "level"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="size-3.5 text-primary" />
            <span>{t("admin.dashboard.quickCreate.tabLevel", "Experience Level")}</span>
          </button>
        </div>

        {/* Feedback / Alert */}
        {successMessage && (
          <div
            role="status"
            className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in zoom-in-95"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {currentError && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
          >
            {getApiErrorMessage(
              currentError,
              isArabic ? "حدث خطأ أثناء الحفظ." : "Could not create item.",
            )}
          </div>
        )}

        {/* Form: Category */}
        {activeTab === "category" && (
          <form onSubmit={handleSubmitCategory} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-cat-en" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.categoryEnLabel", "English Name")} *
                </Label>
                <Input
                  id="qc-cat-en"
                  value={categoryLabelEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryLabelEn(val);
                    if (!isCategoryKeyManuallyEdited) {
                      setCategoryKey(slugify(val));
                    }
                  }}
                  placeholder={t(
                    "admin.dashboard.quickCreate.categoryEnPlaceholder",
                    "Backend Engineering",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-cat-ar" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.categoryArLabel", "Arabic Name")} *
                </Label>
                <Input
                  id="qc-cat-ar"
                  dir="rtl"
                  value={categoryLabelAr}
                  onChange={(e) => setCategoryLabelAr(e.target.value)}
                  placeholder={t(
                    "admin.dashboard.quickCreate.categoryArPlaceholder",
                    "هندسة الواجهات الخلفية",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-start">
              <div className="flex items-center justify-between">
                <Label htmlFor="qc-cat-key" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.categoryKeyLabel", "Category Key (Slug)")} *
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {t("admin.dashboard.quickCreate.autoSlugHelp", "Auto-generated or custom")}
                </span>
              </div>
              <Input
                id="qc-cat-key"
                dir="ltr"
                value={categoryKey}
                onChange={(e) => {
                  setCategoryKey(slugify(e.target.value));
                  setIsCategoryKeyManuallyEdited(true);
                }}
                placeholder={t(
                  "admin.dashboard.quickCreate.categoryKeyPlaceholder",
                  "backend-engineering",
                )}
                required
                className="h-10 font-mono text-xs rounded-xl"
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !categoryKey.trim() || !categoryLabelAr.trim() || !categoryLabelEn.trim()}
                className="rounded-xl text-xs gap-1.5 shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>
                  {isSubmitting
                    ? t("admin.dashboard.quickCreate.creating", "Creating...")
                    : t("admin.dashboard.quickCreate.createButton", "Create Item")}
                </span>
              </Button>
            </div>
          </form>
        )}

        {/* Form: Field */}
        {activeTab === "field" && (
          <form onSubmit={handleSubmitField} className="mt-4 flex flex-col gap-4">
            <div className="space-y-1.5 text-start">
              <Label htmlFor="qc-field-cat" className="text-xs font-medium">
                {t("admin.dashboard.quickCreate.fieldCategorySelect", "Select Parent Category")} *
              </Label>
              <NativeSelect
                id="qc-field-cat"
                value={effectiveCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-10 text-xs rounded-xl"
                disabled={categories.length === 0}
              >
                {categories.map((cat) => (
                  <NativeSelectOption key={cat.id} value={cat.id}>
                    {isArabic ? cat.labelAr : cat.labelEn} ({cat.key})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {categories.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {t(
                    "contributor.admin.noCategoriesYet",
                    "No categories yet. Create a category first.",
                  )}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-field-en" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.fieldEnLabel", "English Field Name")} *
                </Label>
                <Input
                  id="qc-field-en"
                  value={fieldLabelEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFieldLabelEn(val);
                    if (!isFieldKeyManuallyEdited) {
                      setFieldKey(slugify(val));
                    }
                  }}
                  placeholder={t(
                    "admin.dashboard.quickCreate.fieldEnPlaceholder",
                    "NestJS Development",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-field-ar" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.fieldArLabel", "Arabic Field Name")} *
                </Label>
                <Input
                  id="qc-field-ar"
                  dir="rtl"
                  value={fieldLabelAr}
                  onChange={(e) => setFieldLabelAr(e.target.value)}
                  placeholder={t(
                    "admin.dashboard.quickCreate.fieldArPlaceholder",
                    "تطوير NestJS",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-start">
              <div className="flex items-center justify-between">
                <Label htmlFor="qc-field-key" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.fieldKeyLabel", "Field Key (Slug)")} *
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {t("admin.dashboard.quickCreate.autoSlugHelp", "Auto-generated or custom")}
                </span>
              </div>
              <Input
                id="qc-field-key"
                dir="ltr"
                value={fieldKey}
                onChange={(e) => {
                  setFieldKey(slugify(e.target.value));
                  setIsFieldKeyManuallyEdited(true);
                }}
                placeholder={t("admin.dashboard.quickCreate.fieldKeyPlaceholder", "nestjs")}
                required
                className="h-10 font-mono text-xs rounded-xl"
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  isSubmitting ||
                  !effectiveCategoryId ||
                  !fieldKey.trim() ||
                  !fieldLabelAr.trim() ||
                  !fieldLabelEn.trim()
                }
                className="rounded-xl text-xs gap-1.5 shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>
                  {isSubmitting
                    ? t("admin.dashboard.quickCreate.creating", "Creating...")
                    : t("admin.dashboard.quickCreate.createButton", "Create Item")}
                </span>
              </Button>
            </div>
          </form>
        )}

        {/* Form: Level */}
        {activeTab === "level" && (
          <form onSubmit={handleSubmitLevel} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-level-en" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.levelEnLabel", "English Level Name")} *
                </Label>
                <Input
                  id="qc-level-en"
                  value={levelLabelEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLabelEn(val);
                    if (!isLevelKeyManuallyEdited) {
                      setLevelKey(slugify(val));
                    }
                  }}
                  placeholder={t(
                    "admin.dashboard.quickCreate.levelEnPlaceholder",
                    "Senior / Expert",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-level-ar" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.levelArLabel", "Arabic Level Name")} *
                </Label>
                <Input
                  id="qc-level-ar"
                  dir="rtl"
                  value={levelLabelAr}
                  onChange={(e) => setLabelAr(e.target.value)}
                  placeholder={t(
                    "admin.dashboard.quickCreate.levelArPlaceholder",
                    "متقدم / خبير",
                  )}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-level-key" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.levelKeyLabel", "Level Key (Slug)")} *
                </Label>
                <Input
                  id="qc-level-key"
                  dir="ltr"
                  value={levelKey}
                  onChange={(e) => {
                    setLevelKey(slugify(e.target.value));
                    setIsLevelKeyManuallyEdited(true);
                  }}
                  placeholder={t("admin.dashboard.quickCreate.levelKeyPlaceholder", "senior")}
                  required
                  className="h-10 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="qc-level-order" className="text-xs font-medium">
                  {t("admin.dashboard.quickCreate.sortOrderLabel", "Display Order")}
                </Label>
                <Input
                  id="qc-level-order"
                  type="number"
                  value={levelSortOrder ?? ""}
                  onChange={(e) =>
                    setLevelSortOrder(
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                  placeholder="0, 10, 20..."
                  className="h-10 font-mono text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !levelKey.trim() || !levelLabelAr.trim() || !levelLabelEn.trim()}
                className="rounded-xl text-xs gap-1.5 shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>
                  {isSubmitting
                    ? t("admin.dashboard.quickCreate.creating", "Creating...")
                    : t("admin.dashboard.quickCreate.createButton", "Create Item")}
                </span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
