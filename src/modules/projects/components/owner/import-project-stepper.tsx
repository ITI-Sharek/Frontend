import {
  CircleCheck,
  Loader2,
  Lock,
  Search,
  Star,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import { startGitHubConnect } from "@/modules/github";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StepIndicator } from "@/shared/components/navigation/step-indicator";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { cn } from "@/lib/utils";

import {
  getOwnerRepos,
  importRepoAsDraft,
  publishProject,
} from "../../services/my-projects.service";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "../explore-filters";
import type {
  ImportDraftDto,
  RepoPickDto,
} from "../../types/my-projects.types";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../../types/explore.types";

const STEPS = ["اختيار المستودع", "مراجعة البيانات", "النشر"] as const;

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as ProjectDifficulty[];

/**
 * OJ-1 import & publish stepper (screen-inventory §4.3): repo pick (with
 * paste fallback + distinct failure causes) → metadata review (fetched
 * fields labeled «من GitHub», category/difficulty with matching help) →
 * publish confirm with visibility consequence.
 */
export function ImportProjectStepper({
  myProjectsHref,
}: {
  myProjectsHref: string;
}) {
  const [step, setStep] = useState(0);
  const [repos, setRepos] = useState<RepoPickDto[] | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [pasted, setPasted] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [repoLoadError, setRepoLoadError] = useState<string | null>(null);
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string | null>(null);
  const [connectingGitHub, setConnectingGitHub] = useState(false);
  const [draft, setDraft] = useState<ImportDraftDto | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    void getOwnerRepos()
      .then((ownerRepos) => {
        setRepos(ownerRepos);
        setRepoLoadError(null);
      })
      .catch((error) => {
        setRepos([]);
        setRepoLoadError(getRepositoryLoadErrorMessage(error));
      });
  }, []);

  async function handleImport(fullName: string) {
    setImportError(null);
    setPublishError(null);
    setImporting(fullName);
    try {
      const imported = await importRepoAsDraft(fullName);
      setSelectedRepoFullName(fullName);
      setDraft(imported);
      setPublished(false);
      setStep(1);
    } catch (error) {
      setImportError(
        getApiErrorMessage(error, "تعذر الاستيراد — حاول مرة أخرى."),
      );
    } finally {
      setImporting(null);
    }
  }

  async function handlePublish() {
    if (draft === null || selectedRepoFullName === null) return;

    setPublishError(null);
    setPublishing(true);
    try {
      await publishProject(selectedRepoFullName, {
        title: draft.title,
        description: draft.description,
        technologies: draft.technologies,
        category: draft.category,
        difficulty: draft.difficulty,
      });
      setPublished(true);
    } catch (error) {
      setPublishError(
        getApiErrorMessage(error, "تعذر نشر المشروع — حاول مرة أخرى."),
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleConnectGitHub() {
    setConnectingGitHub(true);
    setRepoLoadError(null);
    try {
      await startGitHubConnect(window.location.pathname);
    } catch (error) {
      setRepoLoadError(
        getApiErrorMessage(error, "تعذر فتح ربط GitHub — حاول مرة أخرى."),
      );
      setConnectingGitHub(false);
    }
  }

  const filteredRepos = (repos ?? []).filter((repo) =>
    repo.fullName.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">استيراد مشروع</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          من مستودع GitHub إلى مشروع منشور يراه المساهمون.
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={published ? 3 : step} />

      {step === 0 && (
        <Card>
          <label className="flex items-center gap-2.5 rounded-input border border-border bg-input-bg px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={repoSearch}
              onChange={(event) => setRepoSearch(event.target.value)}
              placeholder="ابحث في مستودعاتك…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-input-placeholder"
            />
          </label>

          <div className="mt-3 flex flex-col gap-2">
            {repos === null ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                جارٍ جلب مستودعاتك…
              </p>
            ) : repoLoadError ? (
              <div className="py-6 text-center">
                <p className="text-sm leading-6 text-destructive">
                  {repoLoadError}
                </p>
                {isGitHubNotConnectedMessage(repoLoadError) && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    disabled={connectingGitHub}
                    onClick={() => void handleConnectGitHub()}
                  >
                    {connectingGitHub && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    ربط GitHub
                  </Button>
                )}
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.fullName}
                  type="button"
                  disabled={repo.isPrivate || importing !== null}
                  onClick={() => void handleImport(repo.fullName)}
                  className={cn(
                    "flex items-center gap-3 rounded-input border border-border bg-background p-3.5 text-start transition-colors",
                    repo.isPrivate
                      ? "cursor-not-allowed opacity-60"
                      : "hover:border-primary/50",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="text-end font-mono text-[13px] font-bold tracking-[0.65px] text-foreground">
                      {repo.fullName}
                    </p>
                    {repo.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.isPrivate ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="size-3.5" />
                      خاص
                    </span>
                  ) : importing === repo.fullName ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5" />
                      {repo.stars}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <form
            className="mt-4 flex gap-2 border-t border-border pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (pasted.trim() !== "") void handleImport(pasted.trim());
            }}
          >
            <input
              dir="ltr"
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              placeholder="owner/repo"
              className="w-full flex-1 rounded-input border border-border bg-input-bg px-[17px] py-2.5 font-mono text-[13px] tracking-[0.65px] text-foreground outline-none placeholder:text-input-placeholder"
            />
            <Button type="submit" size="sm" variant="outline" disabled={importing !== null}>
              استيراد بالاسم
            </Button>
          </form>

          {importError && (
            <p className="mt-3 text-sm leading-6 text-destructive">{importError}</p>
          )}
        </Card>
      )}

      {step === 1 && draft !== null && (
        <Card>
          <h2 className="text-lg font-bold text-foreground">راجع بيانات المشروع</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            الحقول المعلَّمة «من GitHub» جُلبت تلقائيًا — عدّلها كما تريد.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <FieldLabel label="العنوان" fetched={draft.fetchedFields.includes("title")}>
              <input
                dir="ltr"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="w-full rounded-input border border-border bg-input-bg px-[17px] py-2.5 font-mono text-[13px] tracking-[0.65px] text-foreground outline-none"
              />
            </FieldLabel>

            <FieldLabel label="الوصف" fetched={draft.fetchedFields.includes("description")}>
              <textarea
                dir="rtl"
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-sm text-foreground outline-none"
              />
            </FieldLabel>

            <FieldLabel
              label="التصنيف"
              hint="يُستخدم في الاكتشاف والمطابقة"
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <PillOption
                    key={category}
                    label={CATEGORY_LABELS[category]}
                    selected={draft.category === category}
                    onSelect={() => setDraft({ ...draft, category })}
                  />
                ))}
              </div>
            </FieldLabel>

            <FieldLabel
              label="مستوى الصعوبة"
              hint="المبالغة في رفع المستوى تُقصي المتقدمين المناسبين"
            >
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((difficulty) => (
                  <PillOption
                    key={difficulty}
                    label={DIFFICULTY_LABELS[difficulty]}
                    selected={draft.difficulty === difficulty}
                    onSelect={() => setDraft({ ...draft, difficulty })}
                  />
                ))}
              </div>
            </FieldLabel>
          </div>

          <div className="mt-5 flex gap-2.5 border-t border-border pt-4">
            <Button
              className="flex-1"
              disabled={draft.category === null || draft.difficulty === null || draft.title.trim() === ""}
              onClick={() => {
                setPublishError(null);
                setStep(2);
              }}
            >
              متابعة إلى النشر
            </Button>
            <Button variant="outline" onClick={() => setStep(0)}>
              رجوع
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && draft !== null && !published && (
        <Card>
          <h2 className="text-lg font-bold text-foreground">جاهز للنشر؟</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            بعد النشر سيظهر «<bdi className="font-mono text-[13px] tracking-[0.65px] text-foreground">{draft.title}</bdi>»
            لكل المساهمين في صفحة الاستكشاف، وتُفهرس بياناته للبحث الدلالي.
            يمكنك أرشفته لاحقًا في أي وقت.
          </p>
          {publishError && (
            <p className="mt-3 text-sm leading-6 text-destructive">
              {publishError}
            </p>
          )}
          <div className="mt-4 flex gap-2.5">
            <Button
              className="flex-1"
              disabled={publishing}
              onClick={() => void handlePublish()}
            >
              {publishing && <Loader2 className="size-4 animate-spin" />}
              نشر المشروع
            </Button>
            <Button
              variant="outline"
              disabled={publishing}
              onClick={() => setStep(1)}
            >
              رجوع
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            الخروج الآن يحفظ المشروع كمسودة تلقائيًا.
          </p>
        </Card>
      )}

      {published && draft !== null && (
        <Card className="border-primary/40 bg-primary/5">
          <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-primary">
            <CircleCheck className="size-4" />
            منشور
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            مشروعك الآن في الاستكشاف
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            الخطوة التالية: أنشئ أول طلب مساهمة ليبدأ المؤهلون بالتقديم.
          </p>
          <div className="mt-4 flex gap-2.5">
            <Button size="sm">
              إنشاء طلب مساهمة (14 من 20 هذا الشهر)
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={myProjectsHref}>العودة إلى مشاريعي</a>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function getRepositoryLoadErrorMessage(error: unknown): string {
  if (
    isAxiosError(error) &&
    error.response?.data?.code === "GITHUB_ACCOUNT_NOT_CONNECTED"
  ) {
    return "حساب GitHub غير مربوط بهذا المستخدم — اربطه أولاً أو استورد مستودعًا عامًا بالاسم.";
  }

  return getApiErrorMessage(
    error,
    "تعذر جلب مستودعات GitHub — تأكد من ربط حسابك وحاول مرة أخرى.",
  );
}

function isGitHubNotConnectedMessage(message: string): boolean {
  return message.includes("GitHub غير مربوط");
}

function FieldLabel({
  label,
  fetched = false,
  hint,
  children,
}: {
  label: string;
  fetched?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {fetched && (
          <span className="rounded-full bg-border/50 px-2 py-0.5 font-mono text-[10px] tracking-[0.65px] text-muted-foreground">
            من GitHub
          </span>
        )}
        {hint && (
          <span className="text-[11px] font-normal text-muted-foreground">
            — {hint}
          </span>
        )}
      </span>
      {children}
    </div>
  );
}

function PillOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
