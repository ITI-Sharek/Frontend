import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode,
  FileText,
  FolderGit2,
  GitBranch,
  Globe,
  Layers,
  Loader2,
  Lock,
  Plus,
  Rocket,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  UploadCloud,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";
import { cn } from "@/lib/utils";

import { useCreateProjectDraftMutation } from "../../api/mutations/use-create-project-draft-mutation";
import { usePreviewGitHubRepositoryMutation } from "../../api/mutations/use-preview-github-repository-mutation";
import { usePublishProjectMutation } from "../../api/mutations/use-publish-project-mutation";
import { useUploadProjectHeroImageMutation } from "../../api/mutations/use-upload-project-hero-image-mutation";
import {
  getProjectApiErrorMessage,
  isPreviewStaleError,
} from "../../utils/project-error-presenter";
import { formatFieldList, parseFieldList } from "../../utils/project-field-list";
import { getDifficultyLabel } from "../explore-filters";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../../types/project.types";
import type {
  PreviewGitHubRepositoryResponseDto,
  ProjectOwnerViewDto,
} from "../../types/project-draft.types";

export interface SuggestedRepository {
  fullName: string;
  description: string | null;
  isPrivate: boolean;
}

export interface QueuedMaterial {
  id: string;
  file: File;
  title: string;
  visibility: "PUBLIC" | "RESTRICTED_PROJECT";
}

export interface DynamicCategoryItem {
  id: ProjectCategory | string;
  label: string;
  icon?: typeof Globe;
}

export interface DynamicDifficultyItem {
  id: ProjectDifficulty | string;
  label: string;
}

export interface ImportProjectStepperProps {
  onDraftCreated: (projectId: string) => void;
  onProjectPublished?: (projectId: string, projectSlug: string) => void;
  onUploadMaterials?: (
    projectId: string,
    materials: QueuedMaterial[],
  ) => Promise<void>;
  suggestedRepositories?: SuggestedRepository[];
  suggestedRepositoriesLoading?: boolean;
  suggestedRepositoriesError?: string | null;
  needsGitHubConnection?: boolean;
  onConnectGitHub?: () => void;
  categories?: DynamicCategoryItem[];
  technologies?: string[];
  difficulties?: DynamicDifficultyItem[];
}

const POPULAR_TECH_PRESETS = [
  "TypeScript",
  "React",
  "Python",
  "Go",
  "Rust",
  "Next.js",
  "Docker",
  "Node.js",
  "TailwindCSS",
  "PostgreSQL",
];

function getCategoryIcon(key: string): typeof Globe {
  const lower = key.toLowerCase();
  if (
    lower.includes("mobile") ||
    lower.includes("app") ||
    lower.includes("ios") ||
    lower.includes("android") ||
    lower.includes("تطبيقات")
  )
    return Smartphone;
  if (
    lower.includes("ai") ||
    lower.includes("ml") ||
    lower.includes("data") ||
    lower.includes("intelligence") ||
    lower.includes("ذكاء")
  )
    return Sparkles;
  if (
    lower.includes("devops") ||
    lower.includes("cloud") ||
    lower.includes("infra") ||
    lower.includes("سحاب")
  )
    return Layers;
  if (
    lower.includes("system") ||
    lower.includes("embedded") ||
    lower.includes("core") ||
    lower.includes("أنظمة")
  )
    return FileCode;
  if (
    lower.includes("tool") ||
    lower.includes("util") ||
    lower.includes("cli") ||
    lower.includes("أدوات")
  )
    return Wrench;
  return Globe;
}

export function ImportProjectStepper({
  onDraftCreated,
  onProjectPublished,
  onUploadMaterials,
  suggestedRepositories = [],
  suggestedRepositoriesLoading = false,
  suggestedRepositoriesError = null,
  needsGitHubConnection = false,
  onConnectGitHub,
  categories,
  technologies: propTechnologies,
  difficulties,
}: ImportProjectStepperProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = categories ?? [];
  const techPresets =
    propTechnologies && propTechnologies.length > 0
      ? propTechnologies
      : POPULAR_TECH_PRESETS;
  const difficultyOptions = difficulties ?? [];

  // Stepper state (1: Repo, 2: Details & Identity, 3: Materials, 4: Launch)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Repository Reference & Preview
  const [reference, setReference] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [preview, setPreview] =
    useState<PreviewGitHubRepositoryResponseDto | null>(null);
  const [draftIdempotencyKey, setDraftIdempotencyKey] = useState<string | null>(
    null,
  );
  const [createdDraft, setCreatedDraft] = useState<ProjectOwnerViewDto | null>(
    null,
  );

  // Step 2: Project Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [difficulty, setDifficulty] =
    useState<ProjectDifficulty | null>("intermediate");
  const [newTechInput, setNewTechInput] = useState("");
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [uploadedHeroImage, setUploadedHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);

  // Step 3: Materials
  const [queuedMaterials, setQueuedMaterials] = useState<QueuedMaterial[]>([]);

  // Step 4: Submission & Success Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedProject, setPublishedProject] = useState<{
    id: string;
    slug: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const previewMutation = usePreviewGitHubRepositoryMutation();
  const createDraftMutation = useCreateProjectDraftMutation();
  const publishMutation = usePublishProjectMutation();
  const uploadHeroImageMutation = useUploadProjectHeroImageMutation();

  useEffect(() => {
    return () => {
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
    };
  }, [heroImagePreview]);

  const stepLabels = [
    t("project.import.stepRepository", "Repository"),
    t("project.import.stepIdentity", "Identity"),
    t("project.import.stepMaterials", "Materials"),
    t("project.import.stepReview", "Launch"),
  ];

  function handlePreview(referenceValue: string) {
    const trimmed = referenceValue.trim();
    if (trimmed === "") return;
    setReference(trimmed);
    setSubmitError(null);
    previewMutation.mutate(
      { repositoryReference: trimmed },
      {
        onSuccess: (result) => {
          setPreview(result);
          setTitle(result.ownerDefaults.title);
          setDescription(result.ownerDefaults.description ?? "");
          setTags(formatFieldList(result.ownerDefaults.tags));
          setTechnologies(formatFieldList(result.ownerDefaults.technologies));
          setCategory(null);
          setDifficulty("intermediate");
          setDraftIdempotencyKey(createIdempotencyKey());
          setCreatedDraft(null);
          setUploadedHeroImage(null);
          setCurrentStep(2);
        },
      },
    );
  }

  function handleAddFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: QueuedMaterial[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      visibility: "PUBLIC",
    }));
    setQueuedMaterials((prev) => [...prev, ...newItems]);
  }

  function handleHeroImageChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 5_000_000
    ) {
      setSubmitError(
        t(
          "project.import.heroImageInvalid",
          "Choose a PNG, JPEG, or WebP image no larger than 5 MB.",
        ),
      );
      return;
    }
    setSubmitError(null);
    setHeroImage(file);
    setUploadedHeroImage(null);
    setHeroImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveMaterial(id: string) {
    setQueuedMaterials((prev) => prev.filter((item) => item.id !== id));
  }

  function handleUpdateMaterial(
    id: string,
    updates: Partial<QueuedMaterial>,
  ) {
    setQueuedMaterials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function toggleTechnology(tech: string) {
    const currentList = parseFieldList(technologies);
    const exists = currentList.some(
      (tItem) => tItem.toLowerCase() === tech.toLowerCase(),
    );
    const updated = exists
      ? currentList.filter(
          (tItem) => tItem.toLowerCase() !== tech.toLowerCase(),
        )
      : [...currentList, tech];
    setTechnologies(formatFieldList(updated));
  }

  function addCustomTechnology() {
    const trimmed = newTechInput.trim();
    if (!trimmed) return;
    const currentList = parseFieldList(technologies);
    if (
      !currentList.some((tItem) => tItem.toLowerCase() === trimmed.toLowerCase())
    ) {
      setTechnologies(formatFieldList([...currentList, trimmed]));
    }
    setNewTechInput("");
  }

  async function executeSave(shouldPublish: boolean) {
    if (preview === null || draftIdempotencyKey === null) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let project = createdDraft;
      if (!project) {
        project = await createDraftMutation.mutateAsync({
          idempotencyKey: draftIdempotencyKey,
          source: {
            provider: "github",
            repositoryReference: reference,
            previewFingerprint: preview.previewFingerprint,
          },
          project: {
            title,
            description: description.trim() === "" ? null : description,
            tags: parseFieldList(tags),
            technologies: parseFieldList(technologies),
            category,
            difficulty,
          },
        });
        setCreatedDraft(project);
      }

      if (heroImage && uploadedHeroImage !== heroImage) {
        project = await uploadHeroImageMutation.mutateAsync({
          projectId: project.id,
          expectedRevision: project.revision,
          file: heroImage,
          idempotencyKey: createIdempotencyKey(),
        });
        setCreatedDraft(project);
        setUploadedHeroImage(heroImage);
      }

      if (queuedMaterials.length > 0 && onUploadMaterials) {
        try {
          await onUploadMaterials(project.id, queuedMaterials);
        } catch (matErr) {
          console.error("Material upload warning:", matErr);
        }
      }

      if (shouldPublish) {
        await publishMutation.mutateAsync({
          projectId: project.id,
          idempotencyKey: createIdempotencyKey(),
          expectedRevision: project.revision,
          confirm: true,
        });

        setPublishedProject({ id: project.id, slug: project.slug });
        if (onProjectPublished) {
          onProjectPublished(project.id, project.slug);
        }
      } else {
        onDraftCreated(project.id);
      }
    } catch (err) {
      if (isPreviewStaleError(err)) {
        setPreview(null);
        setCurrentStep(1);
      }
      setSubmitError(getProjectApiErrorMessage(t, err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredSuggestedRepos = suggestedRepositories.filter((repo) =>
    repo.fullName.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const selectedTechs = parseFieldList(technologies);
  const STEP_ICONS = [FolderGit2, Sparkles, FileText, Rocket];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      {/* ── Compact Top Studio Header & Step Navigator ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <a href="/my-projects" className="transition-colors hover:text-foreground">
              {t("project.owner.myProjects", "My projects")}
            </a>
            <span>/</span>
            <span className="font-semibold text-foreground">
              {t("project.import.wizardTitle", "Launch a New Project")}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {t("project.import.wizardTitle", "Launch a New Project")}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              {t("project.import.wizardBadge", "Project Launch Studio")}
            </span>
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface-fog p-1">
          {stepLabels.map((label, idx) => {
            const stepNumber = idx + 1;
            const isActive = currentStep === stepNumber;
            const isComplete = currentStep > stepNumber;
            const Icon = STEP_ICONS[idx] ?? Sparkles;
            return (
              <button
                key={label}
                type="button"
                disabled={
                  isSubmitting || (!isComplete && !preview && stepNumber > 1)
                }
                onClick={() => {
                  if (isComplete || preview || stepNumber <= currentStep) {
                    setCurrentStep(stepNumber);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isComplete
                      ? "bg-card text-primary hover:bg-surface-muted"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-3.5" />
                ) : (
                  <Icon className="size-3.5" />
                )}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{stepNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Wide 2-Column Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Main Workspace Column (8 cols) */}
        <div className="lg:col-span-8">
          {/* STEP 1: Repository Sync */}
          {currentStep === 1 && (
            <Card className="flex h-full flex-col justify-between p-6">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("project.import.stepRepository", "Connect Repository")}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(
                      "project.import.referencePlaceholder",
                      "Enter a repository name or full GitHub link to fetch repository data.",
                    )}
                  </p>
                </div>

                {/* Direct Input Form */}
                <form
                  className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePreview(reference);
                  }}
                >
                  <div className="relative flex-1">
                    <InputGroup className="h-10 rounded-xl border-border bg-card shadow-xs focus-within:border-primary">
                      <InputGroupInput
                        dir="ltr"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="e.g. facebook/react or https://github.com/owner/repo"
                        className="h-full font-mono text-xs sm:text-sm tracking-wide"
                      />
                      <InputGroupAddon align="inline-start">
                        <Search className="size-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <Button
                    type="submit"
                    disabled={previewMutation.isPending || reference.trim() === ""}
                    className="h-10 shrink-0 gap-2 rounded-xl font-bold"
                  >
                    {previewMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t("project.import.fetchingPreview", "Analyzing...")}</span>
                      </>
                    ) : (
                      <>
                        <FolderGit2 className="size-4" />
                        <span>{t("project.import.previewRepository", "Inspect Repository")}</span>
                      </>
                    )}
                  </Button>
                </form>

                {previewMutation.isError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {getProjectApiErrorMessage(t, previewMutation.error)}
                  </div>
                )}

                {/* Linked Repositories Picker in 2-Column Grid */}
                {suggestedRepositories.length > 0 && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("project.import.chooseLinked", "Or select from your linked repositories")}
                      </h3>
                      {suggestedRepositories.length > 4 && (
                        <div className="w-44">
                          <Input
                            placeholder={t("project.import.searchLinkedRepos", "Filter repos...")}
                            value={repoSearch}
                            onChange={(e) => setRepoSearch(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {filteredSuggestedRepos.map((repo) => (
                        <button
                          key={repo.fullName}
                          type="button"
                          disabled={previewMutation.isPending}
                          onClick={() => handlePreview(repo.fullName)}
                          className={cn(
                            "group flex items-start gap-2.5 rounded-xl border border-border bg-surface-fog p-3 text-start transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs",
                            reference === repo.fullName &&
                              "border-primary bg-primary/5 ring-1 ring-primary/30",
                          )}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderGit2 className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                dir="ltr"
                                className="truncate font-mono text-xs font-bold text-foreground group-hover:text-primary"
                              >
                                {repo.fullName}
                              </span>
                              {repo.isPrivate && (
                                <Lock className="size-3 shrink-0 text-muted-foreground" />
                              )}
                            </div>
                            {repo.description && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                {repo.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestedRepositoriesLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{t("project.import.loadingLinked", "Loading your linked repositories...")}</span>
                  </div>
                )}

                {suggestedRepositoriesError && (
                  <p role="alert" className="text-xs text-destructive">
                    {suggestedRepositoriesError}
                  </p>
                )}

                {needsGitHubConnection && onConnectGitHub && (
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-fog p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-xs">
                        <FolderGit2 className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {t("project.import.connectGitHub", "Connect GitHub Account")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t(
                            "project.import.connectGitHubDescription",
                            "Connect the Sharek GitHub App to browse your repositories directly.",
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-xs font-bold"
                      onClick={onConnectGitHub}
                    >
                      <ExternalLink className="size-3.5" />
                      <span>{t("project.import.connectGitHub", "Connect GitHub Account")}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 1 Footer (if repository already verified) */}
              {preview && (
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4" />
                    <span>{t("project.import.completeData", "Repository Verified")}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <span>{t("project.import.continue", "Continue to Details")}</span>
                    <ChevronRight className="size-3.5 rtl:hidden" />
                    <ChevronLeft className="size-3.5 ltr:hidden" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* STEP 2: Project Details & Identity */}
          {currentStep === 2 && (
            <Card className="flex h-full flex-col justify-between p-6">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("project.import.reviewData", "Project Details & Identity")}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(
                      "project.import.reviewDescription",
                      "Fine-tune the detected information, categorize your project, and set technical tags.",
                    )}
                  </p>
                </div>

                {/* 2-Column Form Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Left Column: Title, Description, Hero Image */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-foreground">
                        {t("project.fields.title", "Project Title")} *
                      </label>
                      <Input
                        dir="ltr"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("project.import.titlePlaceholder", "e.g. Sharek Platform")}
                        className="mt-1.5 text-xs sm:text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground">
                        {t("project.fields.description", "Description / Summary")}
                      </label>
                      <Textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t(
                          "project.import.descriptionPlaceholder",
                          "Briefly describe your project and what it builds...",
                        )}
                        className="mt-1.5 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Hero Image Uploader */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <label className="text-xs font-bold text-foreground">
                          {t("project.import.heroImage", "Project hero image")}
                        </label>
                        <span className="text-[10px] text-muted-foreground">
                          {t("project.import.heroImageHint", "Optional · PNG, JPEG, or WebP · up to 5 MB")}
                        </span>
                      </div>
                      <input
                        ref={heroImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(event) => handleHeroImageChange(event.target.files)}
                      />
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-fog p-2.5">
                        {heroImagePreview ? (
                          <img
                            src={heroImagePreview}
                            alt={t("project.import.heroImagePreview", "Selected project hero image")}
                            className="size-14 shrink-0 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                            <UploadCloud className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {heroImage?.name ??
                              t(
                                "project.import.heroImageEmpty",
                                "Add a visual identity to your published project.",
                              )}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-1.5 h-7 gap-1 px-2.5 text-[11px]"
                            onClick={() => heroImageInputRef.current?.click()}
                          >
                            <UploadCloud className="size-3" />
                            {heroImage
                              ? t("project.import.changeHeroImage", t("common.change", "Change"))
                              : t("project.import.uploadHeroImage", t("common.uploadImage", "Upload image"))}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Category, Difficulty, Tech Stack */}
                  <div className="space-y-4">
                    {/* Category Selector Grid */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        {t("project.import.categoryTitle", "Project Category")} *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryOptions.map((cat) => {
                          const isSelected = category === cat.id;
                          const Icon = cat.icon ?? getCategoryIcon(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id as ProjectCategory)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border p-2 text-start transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                  : "border-border bg-surface-fog text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-muted-foreground",
                                )}
                              >
                                <Icon className="size-3.5" />
                              </div>
                              <span className="truncate text-xs font-bold">
                                {cat.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Difficulty Level */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        {t("project.import.difficultyTitle", "Target Contributor Difficulty")} *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {difficultyOptions.map((diff) => {
                          const isSelected = difficulty === diff.id;
                          return (
                            <button
                              key={diff.id}
                              type="button"
                              onClick={() => setDifficulty(diff.id as ProjectDifficulty)}
                              className={cn(
                                "rounded-xl border py-1.5 px-2 text-center text-xs transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary/30"
                                  : "border-border bg-surface-fog text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                              )}
                            >
                              <span className="capitalize">{diff.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technologies & Tech Presets */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        {t("project.fields.technologies", "Technologies & Stack")}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {techPresets.slice(0, 10).map((preset) => {
                          const isSelected = selectedTechs.some(
                            (tItem) => tItem.toLowerCase() === preset.toLowerCase(),
                          );
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => toggleTechnology(preset)}
                              className={cn(
                                "rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-medium transition-colors",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground font-bold"
                                  : "border-border bg-surface-fog text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                              )}
                            >
                              {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Tech Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          dir="ltr"
                          value={newTechInput}
                          onChange={(e) => setNewTechInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomTechnology();
                            }
                          }}
                          placeholder={t(
                            "project.import.customTechPlaceholder",
                            "Add custom tech tag (e.g. GraphQL, Redis)...",
                          )}
                          className="h-8 font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCustomTechnology}
                          className="h-8 gap-1 px-3 text-xs"
                        >
                          <Plus className="size-3.5" />
                          <span>{t("common.add", "Add")}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold"
                >
                  <ChevronLeft className="size-3.5 rtl:hidden" />
                  <ChevronRight className="size-3.5 ltr:hidden" />
                  <span>{t("project.import.back", "Back")}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={title.trim() === ""}
                  onClick={() => setCurrentStep(3)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <span>{t("project.import.continue", "Continue to Materials")}</span>
                  <ChevronRight className="size-3.5 rtl:hidden" />
                  <ChevronLeft className="size-3.5 ltr:hidden" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Integrated Materials Upload */}
          {currentStep === 3 && (
            <Card className="flex h-full flex-col justify-between p-6">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("project.import.materialsTitle", "Project Materials & Documentation (Optional)")}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(
                      "project.import.materialsSubtitle",
                      "Upload architecture blueprints, onboarding guides, or READMEs. Projects with documentation attract 3x more contributors.",
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Drag and Drop Zone */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddFiles(e.target.files)}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddFiles(e.dataTransfer.files);
                      }}
                      className="group flex h-48 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-surface-fog/60 p-5 text-center transition-all hover:border-primary hover:bg-surface-muted/50"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <UploadCloud className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {t("project.import.dropMaterialsHere", "Drag & drop project files here, or browse")}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {t("project.import.supportedFileTypes", "PDF, Markdown (.md), Text, DOCX up to 10MB")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Queued Materials List */}
                  <div className="space-y-2.5">
                    {queuedMaterials.length > 0 ? (
                      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                        {queuedMaterials.map((mat) => (
                          <div
                            key={mat.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-xs"
                          >
                            <FileText className="size-4 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <Input
                                value={mat.title}
                                onChange={(e) =>
                                  handleUpdateMaterial(mat.id, { title: e.target.value })
                                }
                                placeholder={t("project.import.materialTitlePlaceholder", "Document title")}
                                className="h-6 px-1.5 text-xs font-semibold"
                              />
                            </div>
                            <select
                              value={mat.visibility}
                              onChange={(e) =>
                                handleUpdateMaterial(mat.id, {
                                  visibility: e.target.value as "PUBLIC" | "RESTRICTED_PROJECT",
                                })
                              }
                              className="h-6 rounded border border-border bg-background px-1.5 text-[11px] font-medium text-foreground"
                            >
                              <option value="PUBLIC">{t("project.import.publicVisibility", "Public")}</option>
                              <option value="RESTRICTED_PROJECT">{t("project.import.restrictedVisibility", "Restricted")}</option>
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMaterial(mat.id)}
                              className="size-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-xl border border-border/60 bg-surface-fog p-4 text-center">
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "project.import.skipMaterialsNote",
                            "You can skip this step and add materials later from the project management workspace.",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3 Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold"
                >
                  <ChevronLeft className="size-3.5 rtl:hidden" />
                  <ChevronRight className="size-3.5 ltr:hidden" />
                  <span>{t("project.import.back", "Back")}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep(4)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <span>{t("project.import.continue", "Continue to Launch")}</span>
                  <ChevronRight className="size-3.5 rtl:hidden" />
                  <ChevronLeft className="size-3.5 ltr:hidden" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Live Preview & One-Click Launch */}
          {currentStep === 4 && (
            <Card className="flex h-full flex-col justify-between p-6">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("project.import.previewTitle", "Launch Readiness & Live Preview")}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(
                      "project.import.previewSubtitle",
                      "Review how your project card will appear on the Discover page before launching.",
                    )}
                  </p>
                </div>

                {/* Readiness Verification Card */}
                <div className="rounded-xl border border-border bg-surface-fog p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("project.import.reviewData", "Project Details & Identity")}
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t("project.import.stepRepository", "Repository")}
                      </span>
                      <p dir="ltr" className="mt-1 truncate font-mono font-bold text-foreground">
                        {preview?.source.fullName || reference}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t("project.fields.category", "Category")}
                      </span>
                      <p className="mt-1 truncate font-bold text-primary">
                        {categoryOptions.find((item) => item.id === category)?.label ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t("project.fields.difficulty", "Difficulty level")}
                      </span>
                      <p className="mt-1 truncate font-bold text-emerald-600 dark:text-emerald-400">
                        {difficulty ? getDifficultyLabel(t, difficulty) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t("project.import.stepMaterials", "Materials")}
                      </span>
                      <p className="mt-1 font-bold text-foreground">
                        {queuedMaterials.length} {t("project.import.stepMaterials", "Materials")}
                      </p>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {submitError}
                  </div>
                )}
              </div>

              {/* Step 4 Actions */}
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold"
                  >
                    <ChevronLeft className="size-3.5 rtl:hidden" />
                    <ChevronRight className="size-3.5 ltr:hidden" />
                    <span>{t("project.import.back", "Back")}</span>
                  </Button>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => executeSave(false)}
                      className="text-xs font-semibold"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t("project.import.saveDraft", "Save as Private Draft")
                      )}
                    </Button>

                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => executeSave(true)}
                      className="gap-2 bg-primary px-5 text-xs font-bold text-primary-foreground"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>{t("project.import.publishing", "Publishing...")}</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="size-4" />
                          <span>{t("project.import.publishNow", "Publish & Launch Project")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-center text-[11px] text-muted-foreground">
                  {t(
                    "project.import.saveNote",
                    "Publishing will immediately feature your project on the Discover page. Saving as draft keeps it private.",
                  )}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right / Sidebar Column: Real-time Live Project Card Preview (4 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Card className="sticky top-6 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("project.import.livePreview", "Live Card Preview")}
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {t("project.import.discoverMode", "Discover View")}
              </span>
            </div>

            {/* Live Interactive Project Card Preview */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              {/* Card Header: Avatar / Hero + Category & Difficulty Badges */}
              <div className="flex items-start justify-between gap-3">
                {heroImagePreview ? (
                  <img
                    src={heroImagePreview}
                    alt={title || "Project Hero"}
                    className="size-11 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {title ? title.slice(0, 1).toUpperCase() : "P"}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {categoryOptions.find((item) => item.id === category)?.label ?? "—"}
                  </span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {difficulty
                      ? getDifficultyLabel(t, difficulty)
                      : t("project.difficulty.intermediate", "Intermediate")}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h4 className="truncate text-sm font-bold text-foreground">
                  {title || t("project.detail.noTitle", "Untitled Project")}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {description ||
                    t("explore.noDescription", "No description for this project yet.")}
                </p>
              </div>

              {/* Tech Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {selectedTechs.length > 0 ? (
                  selectedTechs.map((tech) => (
                    <span
                      key={tech}
                      dir="ltr"
                      className="rounded-full border border-border bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">
                    {t("explore.noTech", "No tech tags specified")}
                  </span>
                )}
              </div>

              {/* Repository & Materials Readiness Footer */}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="size-3 text-primary" />
                  <span dir="ltr" className="truncate font-mono font-medium text-foreground max-w-[120px]">
                    {preview?.source.fullName || reference || t("project.import.notConnected", "Not selected")}
                  </span>
                </div>
                <span>
                  📁 {queuedMaterials.length} {t("project.import.stepMaterials", "Materials")}
                </span>
              </div>
            </div>

            {/* Step Progress Mini-Checklist */}
            <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      preview ? "bg-emerald-500" : "bg-muted-foreground/40",
                    )}
                  />
                  {t("project.import.stepRepository", "Repository")}
                </span>
                <span className="font-mono text-[11px]">
                  {preview ? "✓" : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      title.trim() !== "" && category !== null
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  {t("project.import.stepIdentity", "Identity")}
                </span>
                <span className="font-mono text-[11px]">
                  {title.trim() !== "" && category !== null ? "✓" : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      queuedMaterials.length > 0
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  {t("project.import.stepMaterials", "Materials")}
                </span>
                <span className="font-mono text-[11px]">
                  {queuedMaterials.length > 0
                    ? `✓ (${queuedMaterials.length})`
                    : t("common.optional", "(optional)")}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Success Modal Dialog ── */}
      <Dialog
        open={publishedProject !== null}
        onOpenChange={(open) => {
          if (!open && publishedProject) {
            onDraftCreated(publishedProject.id);
          }
        }}
      >
        <DialogContent className="text-center sm:max-w-md">
          <DialogHeader className="flex flex-col items-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Rocket className="size-7" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {t("project.import.launchSuccessTitle", "Project Launched Successfully!")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t(
                "project.import.launchSuccessDesc",
                "Your project is now live on Sharek. Start publishing contribution requests to welcome developers.",
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Copy Link Row */}
          {publishedProject && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-fog p-2.5">
              <span
                dir="ltr"
                className="flex-1 truncate text-start font-mono text-xs text-muted-foreground"
              >
                {`${window.location.origin}/projects/${publishedProject.slug}`}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${window.location.origin}/projects/${publishedProject.slug}`,
                  );
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="h-8 shrink-0 gap-1.5 text-xs font-semibold"
              >
                {copiedLink ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>
                  {t(
                    copiedLink
                      ? "project.import.linkCopied"
                      : "project.import.copyLink",
                    copiedLink ? "Copied!" : "Copy",
                  )}
                </span>
              </Button>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-col">
            {publishedProject && (
              <>
                <Button asChild className="w-full gap-1.5 text-xs font-bold">
                  <a
                    href={`/my-projects/${publishedProject.id}/contribution-requests/new`}
                  >
                    <Plus className="size-4" />
                    <span>
                      {t(
                        "project.import.createFirstRequest",
                        "Create First Contribution Request",
                      )}
                    </span>
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-xs font-semibold"
                >
                  <a href={`/my-projects/${publishedProject.id}`}>
                    <span>
                      {t(
                        "project.import.goToProject",
                        "Go to Project Workspace",
                      )}
                    </span>
                  </a>
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
