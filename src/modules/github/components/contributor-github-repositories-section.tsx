import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitFork,
  Github,
  Globe,
  LockKeyhole,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useGitHubAccountQuery } from "../api/queries/use-github-account-query";
import { useGitHubRepositoriesQuery } from "../api/queries/use-github-repositories-query";
import { useGitHubRepositoryStatisticsQuery } from "../api/queries/use-github-repository-statistics-query";
import { useStartSkillProfileGenerationMutation } from "../../skill-profiles/api/mutations/use-start-skill-profile-generation-mutation";
import { useSkillProfileGenerationQuery } from "../../skill-profiles/api/queries/use-skill-profile-generation-query";
import type {
  GitHubAccountDto,
  GitHubRepositoryDto,
  GitHubRepositoryPageDto,
  GitHubRepositoryStatisticsDto,
  GitHubRepositoryUnavailableReason,
} from "../types/github.types";
import type {
  SkillProfileGenerationDto,
  SkillProfileGenerationStatus,
} from "../../skill-profiles/types/skill-profile-generation.types";

const REPOSITORY_PAGE_SIZE = 12;
const MAX_SELECTED_REPOSITORIES = 10;

type AccountState =
  | { status: "loading" }
  | { status: "not-connected" }
  | { status: "error"; message?: string }
  | { status: "connected"; account: GitHubAccountDto };

type RepositoriesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message?: string }
  | {
      status: "loaded";
      repositories: GitHubRepositoryDto[];
      page: number;
      perPage: number;
      hasNextPage: boolean;
    };

type StatisticsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message?: string }
  | { status: "loaded"; statistics: GitHubRepositoryStatisticsDto };

type SkillGenerationState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: SkillProfileGenerationStatus;
      generationId: string;
      selectedRepositoryCount: number;
      snapshottedRepositoryCount: number;
      skillCount: number;
      failureReason: string | null;
    }
  | { status: "error"; message?: string };

export interface ContributorGitHubRepositoriesSectionProps {
  accountState: AccountState;
  repositoriesState: RepositoriesState;
  selectedFullName: string | null;
  selectedForGenerationFullNames?: string[];
  statisticsState: StatisticsState;
  skillGenerationState?: SkillGenerationState;
  onConnectGitHub: () => void;
  onRetryAccount?: () => void;
  onRetryRepositories?: () => void;
  onRetryStatistics?: () => void;
  onSelectRepository: (fullName: string) => void;
  onToggleRepositoryForGeneration?: (fullName: string) => void;
  onStartSkillGeneration?: () => void;
  onNextRepositoriesPage: () => void;
  onPreviousRepositoriesPage: () => void;
}

export interface ContributorGitHubRepositoriesPageProps {
  returnTo: string;
  onConnectGitHub: (returnTo: string) => void;
}

export function ContributorGitHubRepositoriesPage({
  returnTo,
  onConnectGitHub,
}: ContributorGitHubRepositoriesPageProps) {
  const accountQuery = useGitHubAccountQuery();
  const hasConnectedAccount = accountQuery.data !== undefined;
  const [repositoriesPage, setRepositoriesPage] = useState(1);
  const repositoriesQuery = useGitHubRepositoriesQuery({
    enabled: hasConnectedAccount,
    page: repositoriesPage,
    perPage: REPOSITORY_PAGE_SIZE,
  });
  const [selectedFullName, setSelectedFullName] = useState<string | null>(null);
  const [selectedForGeneration, setSelectedForGeneration] = useState<string[]>(
    [],
  );
  const [generationId, setGenerationId] = useState<string | null>(null);
  const startGenerationMutation = useStartSkillProfileGenerationMutation();
  const generationQuery = useSkillProfileGenerationQuery({
    generationId: generationId ?? "",
    enabled: generationId !== null,
  });

  const selectedRepositoryExists =
    repositoriesQuery.data?.items.some(
      (repo) => repo.fullName === selectedFullName,
    ) ?? false;

  useEffect(() => {
    if (selectedFullName !== null && !selectedRepositoryExists) {
      setSelectedFullName(null);
    }
  }, [selectedFullName, selectedRepositoryExists]);

  useEffect(() => {
    if (
      repositoriesQuery.data &&
      repositoriesQuery.data.items.length === 0 &&
      repositoriesPage > 1
    ) {
      setRepositoriesPage((currentPage) => currentPage - 1);
    }
  }, [repositoriesPage, repositoriesQuery.data]);

  const statisticsQuery = useGitHubRepositoryStatisticsQuery({
    fullName: selectedFullName ?? "",
    enabled: hasConnectedAccount && selectedFullName !== null,
  });

  return (
    <ContributorGitHubRepositoriesSection
      accountState={getAccountState({
        isPending: accountQuery.isPending,
        data: accountQuery.data,
        error: accountQuery.error,
      })}
      repositoriesState={getRepositoriesState({
        enabled: hasConnectedAccount,
        isPending: repositoriesQuery.isPending,
        data: repositoriesQuery.data,
        error: repositoriesQuery.error,
      })}
      selectedFullName={selectedFullName}
      selectedForGenerationFullNames={selectedForGeneration}
      statisticsState={getStatisticsState({
        selectedFullName,
        isPending: statisticsQuery.isPending,
        data: statisticsQuery.data,
        error: statisticsQuery.error,
      })}
      skillGenerationState={getSkillGenerationState({
        mutationPending: startGenerationMutation.isPending,
        mutationError: startGenerationMutation.error,
        generation: generationQuery.data,
      })}
      onConnectGitHub={() => {
        onConnectGitHub(returnTo);
      }}
      onRetryAccount={() => {
        void accountQuery.refetch();
      }}
      onRetryRepositories={() => {
        void repositoriesQuery.refetch();
      }}
      onRetryStatistics={() => {
        void statisticsQuery.refetch();
      }}
      onSelectRepository={setSelectedFullName}
      onToggleRepositoryForGeneration={(fullName) => {
        setSelectedForGeneration((current) =>
          toggleRepositorySelection(
            current,
            fullName,
            MAX_SELECTED_REPOSITORIES,
          ),
        );
      }}
      onStartSkillGeneration={() => {
        startGenerationMutation.mutate(
          {
            repositories: selectedForGeneration.map((fullName) => ({
              fullName,
            })),
          },
          {
            onSuccess: (generation) => {
              setGenerationId(generation.generationId);
            },
          },
        );
      }}
      onNextRepositoriesPage={() => {
        setRepositoriesPage((currentPage) => currentPage + 1);
      }}
      onPreviousRepositoriesPage={() => {
        setRepositoriesPage((currentPage) => Math.max(1, currentPage - 1));
      }}
    />
  );
}

export function ContributorGitHubRepositoriesSection({
  accountState,
  repositoriesState,
  selectedFullName,
  selectedForGenerationFullNames = [],
  statisticsState,
  skillGenerationState = { status: "idle" },
  onConnectGitHub,
  onRetryAccount,
  onRetryRepositories,
  onRetryStatistics,
  onSelectRepository,
  onToggleRepositoryForGeneration,
  onStartSkillGeneration,
  onNextRepositoriesPage,
  onPreviousRepositoriesPage,
}: ContributorGitHubRepositoriesSectionProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 text-right sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">GitHub</p>
        <h1 className="text-3xl font-semibold text-foreground">
          مستودعاتي على GitHub
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          راجع المستودعات التي منحت Share-k صلاحية قراءتها وشاهد إشارات
          النشاط والالتزامات الحديثة لكل مستودع.
        </p>
      </header>

      {accountState.status === "loading" ? (
        <StateCard
          icon={<RefreshCw className="size-5 animate-spin" aria-hidden />}
          title="جارٍ التحقق من اتصال GitHub..."
          description="لن نحمّل المستودعات قبل موافقتك على ربط مستودعات GitHub."
        />
      ) : null}

      {accountState.status === "not-connected" ? (
        <StateCard
          icon={<Github className="size-5" aria-hidden />}
          title="اربط مستودعات GitHub"
          description="هذا ربط منفصل بعد تسجيل الدخول. سنطلب صلاحية قراءة المستودعات العامة والخاصة لاستخدامها كدليل مهاري."
          action={
            <Button type="button" onClick={onConnectGitHub}>
              السماح بقراءة المستودعات
            </Button>
          }
        />
      ) : null}

      {accountState.status === "error" ? (
        <StateCard
          icon={<AlertCircle className="size-5" aria-hidden />}
          title="تعذر التحقق من اتصال GitHub"
          description={accountState.message ?? "حاول مرة أخرى بعد لحظات."}
          action={
            <Button type="button" variant="outline" onClick={onRetryAccount}>
              إعادة المحاولة
            </Button>
          }
        />
      ) : null}

      {accountState.status === "connected" ? (
        <ConnectedRepositoriesView
          account={accountState.account}
          repositoriesState={repositoriesState}
          selectedFullName={selectedFullName}
          selectedForGenerationFullNames={selectedForGenerationFullNames}
          statisticsState={statisticsState}
          skillGenerationState={skillGenerationState}
          onRetryRepositories={onRetryRepositories}
          onRetryStatistics={onRetryStatistics}
          onSelectRepository={onSelectRepository}
          onToggleRepositoryForGeneration={onToggleRepositoryForGeneration}
          onStartSkillGeneration={onStartSkillGeneration}
          onNextRepositoriesPage={onNextRepositoriesPage}
          onPreviousRepositoriesPage={onPreviousRepositoriesPage}
        />
      ) : null}
    </main>
  );
}

function ConnectedRepositoriesView({
  account,
  repositoriesState,
  selectedFullName,
  selectedForGenerationFullNames,
  statisticsState,
  skillGenerationState,
  onRetryRepositories,
  onRetryStatistics,
  onSelectRepository,
  onToggleRepositoryForGeneration,
  onStartSkillGeneration,
  onNextRepositoriesPage,
  onPreviousRepositoriesPage,
}: {
  account: GitHubAccountDto;
  repositoriesState: RepositoriesState;
  selectedFullName: string | null;
  selectedForGenerationFullNames: string[];
  statisticsState: StatisticsState;
  skillGenerationState: SkillGenerationState;
  onRetryRepositories?: () => void;
  onRetryStatistics?: () => void;
  onSelectRepository: (fullName: string) => void;
  onToggleRepositoryForGeneration?: (fullName: string) => void;
  onStartSkillGeneration?: () => void;
  onNextRepositoriesPage: () => void;
  onPreviousRepositoriesPage: () => void;
}) {
  if (repositoriesState.status === "loading") {
    return (
      <StateCard
        icon={<RefreshCw className="size-5 animate-spin" aria-hidden />}
        title="جارٍ تحميل مستودعاتك..."
        description="نعرض المستودعات العامة والخاصة التي أعادها GitHub لحسابك."
      />
    );
  }

  if (repositoriesState.status === "error") {
    return (
      <StateCard
        icon={<AlertCircle className="size-5" aria-hidden />}
        title="تعذر تحميل المستودعات"
        description={repositoriesState.message ?? "تحقق من اتصالك ثم حاول مجدداً."}
        action={
          <Button type="button" variant="outline" onClick={onRetryRepositories}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }

  if (
    repositoriesState.status === "loaded" &&
    repositoriesState.repositories.length === 0
  ) {
    return (
      <StateCard
        icon={<Github className="size-5" aria-hidden />}
        title="لا توجد مستودعات متاحة"
        description="لم يُرجع GitHub أي مستودعات لهذا الاتصال. قد يعتمد ذلك على صلاحيات OAuth أو حالة الحساب."
      />
    );
  }

  if (repositoriesState.status !== "loaded") return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <section className="flex flex-col gap-4" aria-label="قائمة المستودعات">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              المستودعات المتصلة
            </h2>
            <p className="text-sm text-muted-foreground">
              متصل بحساب{" "}
              <span dir="ltr" className="font-mono text-foreground">
                @{account.username}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-medium text-foreground">
              صفحة {formatNumber(repositoriesState.page)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(repositoriesState.repositories.length)} من أصل{" "}
              {formatNumber(repositoriesState.perPage)} في الصفحة
            </p>
          </div>
        </div>

        <SkillGenerationPanel
          selectedCount={selectedForGenerationFullNames.length}
          skillGenerationState={skillGenerationState}
          onStartSkillGeneration={onStartSkillGeneration}
        />

        <div className="grid gap-3">
          {repositoriesState.repositories.map((repository) => (
            <RepositoryCard
              key={repository.githubRepoId}
              repository={repository}
              isSelected={repository.fullName === selectedFullName}
              isSelectedForGeneration={selectedForGenerationFullNames.includes(
                repository.fullName,
              )}
              selectionLimitReached={
                selectedForGenerationFullNames.length >=
                MAX_SELECTED_REPOSITORIES
              }
              onSelect={() => onSelectRepository(repository.fullName)}
              onToggleForGeneration={
                onToggleRepositoryForGeneration
                  ? () => onToggleRepositoryForGeneration(repository.fullName)
                  : undefined
              }
            />
          ))}
        </div>

        <RepositoryPaginationControls
          page={repositoriesState.page}
          hasNextPage={repositoriesState.hasNextPage}
          onNextPage={onNextRepositoriesPage}
          onPreviousPage={onPreviousRepositoriesPage}
        />
      </section>

      <RepositoryStatisticsPanel
        selectedFullName={selectedFullName}
        statisticsState={statisticsState}
        onRetryStatistics={onRetryStatistics}
      />
    </div>
  );
}

function RepositoryPaginationControls({
  page,
  hasNextPage,
  onNextPage,
  onPreviousPage,
}: {
  page: number;
  hasNextPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
      aria-label="تصفح صفحات المستودعات"
    >
      <p className="text-sm text-muted-foreground">
        الصفحة الحالية {formatNumber(page)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPreviousPage}
        >
          <ChevronRight className="size-4" />
          <span>السابق</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          <span>التالي</span>
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </nav>
  );
}

function RepositoryCard({
  repository,
  isSelected,
  onSelect,
  isSelectedForGeneration,
  selectionLimitReached,
  onToggleForGeneration,
}: {
  repository: GitHubRepositoryDto;
  isSelected: boolean;
  isSelectedForGeneration: boolean;
  selectionLimitReached: boolean;
  onSelect: () => void;
  onToggleForGeneration?: () => void;
}) {
  const languageEntries = getLanguageEntries(repository.languages);

  return (
    <Card
      className={cn(
        "overflow-hidden p-5 transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "hover:border-primary/40 hover:shadow-md",
      )}
    >
      {/* Full-card hit target: sits under the visible content and captures
          any click that isn't over the independently-focusable GitHub link. */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`${isSelected ? "محدد حالياً" : "عرض إحصاءات"} - ${repository.fullName}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-[inherit] outline-none transition-transform active:scale-[0.995] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      <article className="pointer-events-none relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {isSelected ? (
                <CheckCircle2
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
              ) : null}
              <span
                dir="ltr"
                className="block truncate font-mono text-base font-semibold text-foreground"
              >
                {repository.fullName}
              </span>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {repository.description ?? "لا يوجد وصف لهذا المستودع."}
            </p>
          </div>
          <a
            href={repository.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto relative z-20 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden />
            فتح على GitHub
          </a>
        </div>

        {onToggleForGeneration ? (
          <div className="pointer-events-auto flex justify-end">
            <Button
              type="button"
              size="sm"
              variant={isSelectedForGeneration ? "default" : "outline"}
              disabled={selectionLimitReached && !isSelectedForGeneration}
              onClick={(event) => {
                event.stopPropagation();
                onToggleForGeneration();
              }}
            >
              {isSelectedForGeneration ? (
                <CheckCircle2 className="size-4" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              <span>
                {isSelectedForGeneration
                  ? "محدد للتحليل"
                  : "اختيار للتحليل"}
              </span>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <StatusPill
            icon={repository.private ? <LockKeyhole /> : <Globe />}
            label={repository.private ? "خاص" : "عام"}
            tone={repository.private ? "warning" : "neutral"}
          />
          {repository.fork ? <StatusPill icon={<GitFork />} label="Fork" /> : null}
          {repository.archived ? (
            <StatusPill icon={<Archive />} label="مؤرشف" tone="muted" />
          ) : null}
          <StatusPill
            icon={<GitBranch />}
            label={
              <span dir="ltr" className="font-mono">
                {repository.defaultBranch}
              </span>
            }
          />
          {repository.primaryLanguage ? (
            <StatusPill label={repository.primaryLanguage} />
          ) : null}
        </div>

        {languageEntries.length > 0 ? (
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            {languageEntries.map(([language, percent]) => (
              <span
                key={language}
                className="bg-primary"
                style={{ width: `${percent}%` }}
                title={`${language}: ${percent}%`}
              />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
          <Metric icon={<Star />} label="نجوم" value={repository.stars} />
          <Metric icon={<GitFork />} label="Forks" value={repository.forks} />
          <Metric label="Issues" value={repository.openIssues} />
          <Metric label="Watchers" value={repository.watchers} />
        </div>

        {repository.topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {repository.topics.map((topic) => (
              <span
                key={topic}
                dir="ltr"
                className="rounded-full bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <DateDetail label="آخر دفع" value={repository.pushedAt} />
          <DateDetail label="آخر تحديث" value={repository.updatedAt} />
        </dl>

        <div
          className={cn(
            "flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium",
            isSelected ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="size-3.5" aria-hidden />
              <span>محدد للعرض في لوحة الإحصاءات</span>
            </>
          ) : (
            <>
              <MousePointerClick className="size-3.5" aria-hidden />
              <span>اضغط على البطاقة لعرض إحصاءات المستودع</span>
            </>
          )}
        </div>
      </article>
    </Card>
  );
}

function SkillGenerationPanel({
  selectedCount,
  skillGenerationState,
  onStartSkillGeneration,
}: {
  selectedCount: number;
  skillGenerationState: SkillGenerationState;
  onStartSkillGeneration?: () => void;
}) {
  const isBusy =
    skillGenerationState.status === "submitting" ||
    skillGenerationState.status === "queued" ||
    skillGenerationState.status === "collecting_evidence" ||
    skillGenerationState.status === "analyzing";
  const canStart =
    selectedCount > 0 && !isBusy && onStartSkillGeneration !== undefined;

  return (
    <Card className="flex flex-col gap-3 border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            تحليل المهارات من المستودعات المختارة
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            اختر حتى 10 مستودعات قوية. سنرسل الأدلة المختارة للذكاء الاصطناعي
            ثم تُحفظ المهارات في حالة انتظار المراجعة.
          </p>
        </div>
        <Button
          type="button"
          disabled={!canStart}
          onClick={onStartSkillGeneration}
        >
          {isBusy ? (
            <RefreshCw className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          <span>بدء تحليل المهارات</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <StatusPill label={`${formatNumber(selectedCount)} محدد`} />
        <SkillGenerationStatusPill state={skillGenerationState} />
      </div>
    </Card>
  );
}

function SkillGenerationStatusPill({
  state,
}: {
  state: SkillGenerationState;
}) {
  if (state.status === "idle") {
    return <StatusPill label="لم يبدأ التحليل" tone="muted" />;
  }

  if (state.status === "submitting") {
    return <StatusPill label="جارٍ بدء التحليل" tone="warning" />;
  }

  if (state.status === "error") {
    return <StatusPill label={state.message ?? "تعذر بدء التحليل"} tone="warning" />;
  }

  if (state.status === "failed") {
    return (
      <StatusPill
        label={state.failureReason ?? "تعذر اكتمال التحليل"}
        tone="warning"
      />
    );
  }

  if (state.status === "pending_review") {
    return (
      <StatusPill
        label={`${formatNumber(state.skillCount)} مهارات بانتظار المراجعة`}
        tone="neutral"
      />
    );
  }

  if (state.status === "needs_more_evidence") {
    return (
      <StatusPill
        label="الأدلة الحالية غير كافية. اختر مستودعات تحتوي على مساهمات برمجية أوضح."
        tone="warning"
      />
    );
  }

  return (
    <StatusPill
      label={`${getGenerationStatusLabel(state.status)} - ${formatNumber(
        state.snapshottedRepositoryCount,
      )}/${formatNumber(state.selectedRepositoryCount)}`}
      tone="warning"
    />
  );
}

function RepositoryStatisticsPanel({
  selectedFullName,
  statisticsState,
  onRetryStatistics,
}: {
  selectedFullName: string | null;
  statisticsState: StatisticsState;
  onRetryStatistics?: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="إحصاءات المستودع">
      <Card className="p-5">
        {statisticsState.status === "idle" ? (
          <StateContent
            icon={<GitCommit className="size-5" aria-hidden />}
            title="اختر مستودعاً"
            description="اضغط على اسم مستودع من القائمة لعرض النشاط وإشارات الالتزامات."
          />
        ) : null}

        {statisticsState.status === "loading" ? (
          <StateContent
            icon={<RefreshCw className="size-5 animate-spin" aria-hidden />}
            title="جارٍ تحميل الإحصاءات..."
            description={
              selectedFullName ? (
                <span dir="ltr" className="font-mono">
                  {selectedFullName}
                </span>
              ) : (
                "المستودع المحدد"
              )
            }
          />
        ) : null}

        {statisticsState.status === "error" ? (
          <StateContent
            icon={<AlertCircle className="size-5" aria-hidden />}
            title="تعذر تحميل إحصاءات المستودع"
            description={statisticsState.message ?? "حاول مرة أخرى بعد لحظات."}
            action={
              <Button type="button" variant="outline" onClick={onRetryStatistics}>
                إعادة المحاولة
              </Button>
            }
          />
        ) : null}

        {statisticsState.status === "loaded" ? (
          <LoadedStatistics statistics={statisticsState.statistics} />
        ) : null}
      </Card>
    </aside>
  );
}

function LoadedStatistics({
  statistics,
}: {
  statistics: GitHubRepositoryStatisticsDto;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          إحصاءات المستودع
        </h2>
        <p className="text-sm text-muted-foreground">
          الفرع الافتراضي{" "}
          <span dir="ltr" className="font-mono text-foreground">
            {statistics.defaultBranch}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Star />} label="نجوم" value={statistics.stars} />
        <Metric icon={<GitFork />} label="Forks" value={statistics.forks} />
        <Metric label="Issues" value={statistics.openIssues} />
        <Metric label="Watchers" value={statistics.watchers} />
      </div>

      <StatisticsBlock title="نشاط المساهمة">
        {statistics.contributionActivity.unavailableReason ? (
          <UnavailableReason
            reason={statistics.contributionActivity.unavailableReason}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <SmallStat
                label="المساهمون"
                value={statistics.contributionActivity.totalContributors}
              />
              <SmallStat
                label="الالتزامات"
                value={statistics.contributionActivity.totalCommits}
              />
              <SmallStat
                label="آخر سنة"
                value={statistics.contributionActivity.lastYearCommitCount}
              />
            </div>
            <WeeklyCommitBars
              counts={statistics.contributionActivity.weeklyCommitCounts}
            />
            <ContributorList
              contributors={statistics.contributionActivity.topContributors}
            />
          </div>
        )}
      </StatisticsBlock>

      <StatisticsBlock title="إشارات الالتزامات الحديثة">
        {statistics.commitSignals.unavailableReason ? (
          <UnavailableReason reason={statistics.commitSignals.unavailableReason} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <SmallStat
                label="التزامات حديثة"
                value={statistics.commitSignals.recentCommitCount}
              />
              <SmallStat
                label="المؤلفون"
                value={statistics.commitSignals.authors.length}
              />
            </div>
            <DateRange
              oldest={statistics.commitSignals.oldestCommitAt}
              latest={statistics.commitSignals.latestCommitAt}
            />
            {statistics.commitSignals.authors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {statistics.commitSignals.authors.map((author) => (
                  <span
                    key={author}
                    dir="ltr"
                    className="rounded-full bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {author}
                  </span>
                ))}
              </div>
            ) : null}
            <RecentCommits statistics={statistics} />
          </div>
        )}
      </StatisticsBlock>
    </div>
  );
}

function RecentCommits({
  statistics,
}: {
  statistics: GitHubRepositoryStatisticsDto;
}) {
  if (statistics.commitSignals.recentCommits.length === 0) {
    return (
      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        لا توجد التزامات حديثة لعرضها.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {statistics.commitSignals.recentCommits.map((commit) => (
        <li key={commit.sha} className="rounded-md border border-border p-3">
          <a
            href={commit.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="line-clamp-2 text-sm font-medium text-foreground"
          >
            {commit.messageHeadline}
          </a>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span dir="ltr" className="font-mono">
              {commit.sha.slice(0, 7)}
            </span>
            {commit.authorLogin ? (
              <span dir="ltr" className="font-mono">
                @{commit.authorLogin}
              </span>
            ) : null}
            <span>{formatDate(commit.authoredAt)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ContributorList({
  contributors,
}: {
  contributors: GitHubRepositoryStatisticsDto["contributionActivity"]["topContributors"];
}) {
  if (contributors.length === 0) {
    return (
      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        لا توجد قائمة مساهمين متاحة حالياً.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {contributors.map((contributor) => (
        <li
          key={contributor.login}
          className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"
        >
          <a
            dir="ltr"
            href={contributor.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono font-medium text-foreground"
          >
            @{contributor.login}
          </a>
          <span className="text-muted-foreground">
            {formatNumber(contributor.commits)} التزام
          </span>
        </li>
      ))}
    </ol>
  );
}

function WeeklyCommitBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 0);

  if (counts.length === 0 || max === 0) {
    return (
      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        لا توجد بيانات أسبوعية كافية.
      </p>
    );
  }

  return (
    <div className="flex h-16 items-end gap-1" aria-label="نشاط الالتزامات الأسبوعي">
      {counts.map((count, index) => (
        <span
          // Weekly points have no stable id from the backend.
          key={`${index}-${count}`}
          className="min-h-1 flex-1 rounded-t bg-primary"
          style={{ height: `${Math.max(8, (count / max) * 64)}px` }}
          title={`${formatNumber(count)} التزام`}
        />
      ))}
    </div>
  );
}

function UnavailableReason({
  reason,
}: {
  reason: GitHubRepositoryUnavailableReason;
}) {
  return (
    <div className="rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
      {getUnavailableReasonMessage(reason)}
    </div>
  );
}

export function getUnavailableReasonMessage(
  reason: GitHubRepositoryUnavailableReason,
) {
  if (reason === "github_stats_pending") {
    return "لا تزال GitHub تحسب هذه الإحصاءات. جرّب مرة أخرى بعد قليل.";
  }

  if (reason === "github_no_content") {
    return "لا توجد بيانات كافية من GitHub لهذا المستودع حالياً.";
  }

  if (reason === "github_not_found") {
    return "تعذر العثور على إحصاءات هذا المستودع أو الوصول إليها عبر GitHub.";
  }

  if (reason === "github_repository_empty_or_unavailable") {
    return "يبدو أن المستودع فارغ أو غير متاح لإحصاءات GitHub حالياً.";
  }

  if (reason.startsWith("github_http_")) {
    return "أعاد GitHub حالة مؤقتة أثناء جلب الإحصاءات. جرّب مرة أخرى لاحقاً.";
  }

  return "إحصاءات هذا الجزء غير متاحة حالياً.";
}

function StatisticsBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: ReactElement;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
      {icon ? <span className="size-4 text-muted-foreground">{icon}</span> : null}
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-foreground">{formatNumber(value)}</strong>
    </div>
  );
}

function StatusPill({
  icon,
  label,
  tone = "neutral",
}: {
  icon?: ReactElement;
  label: ReactNode;
  tone?: "neutral" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "warning" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        tone === "muted" && "bg-muted/50 text-muted-foreground/70",
      )}
    >
      {icon ? <span className="size-3.5">{icon}</span> : null}
      {label}
    </span>
  );
}

function StateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <StateContent
        icon={icon}
        title={title}
        description={description}
        action={action}
      />
    </Card>
  );
}

function StateContent({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 text-right">
      <div className="rounded-full bg-muted p-3 text-primary">{icon}</div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DateDetail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="text-foreground">{formatDate(value)}</dd>
    </div>
  );
}

function DateRange({
  oldest,
  latest,
}: {
  oldest: string | null;
  latest: string | null;
}) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" aria-hidden />
      من {formatDate(oldest)} إلى {formatDate(latest)}
    </p>
  );
}

function getAccountState({
  isPending,
  data,
  error,
}: {
  isPending: boolean;
  data: GitHubAccountDto | undefined;
  error: Error | null;
}): AccountState {
  if (isPending) return { status: "loading" };
  if (data) return { status: "connected", account: data };
  if (isGitHubAccountNotConnectedError(error)) return { status: "not-connected" };
  if (error) return { status: "error", message: error.message };
  return { status: "not-connected" };
}

function getRepositoriesState({
  enabled,
  isPending,
  data,
  error,
}: {
  enabled: boolean;
  isPending: boolean;
  data: GitHubRepositoryPageDto | undefined;
  error: Error | null;
}): RepositoriesState {
  if (!enabled) return { status: "idle" };
  if (isPending) return { status: "loading" };
  if (error) return { status: "error", message: error.message };
  return {
    status: "loaded",
    repositories: data?.items ?? [],
    page: data?.page ?? 1,
    perPage: data?.perPage ?? REPOSITORY_PAGE_SIZE,
    hasNextPage: data?.hasNextPage ?? false,
  };
}

function getStatisticsState({
  selectedFullName,
  isPending,
  data,
  error,
}: {
  selectedFullName: string | null;
  isPending: boolean;
  data: GitHubRepositoryStatisticsDto | undefined;
  error: Error | null;
}): StatisticsState {
  if (selectedFullName === null) return { status: "idle" };
  if (isPending) return { status: "loading" };
  if (error) return { status: "error", message: error.message };
  if (data) return { status: "loaded", statistics: data };
  return { status: "idle" };
}

function getSkillGenerationState({
  mutationPending,
  mutationError,
  generation,
}: {
  mutationPending: boolean;
  mutationError: Error | null;
  generation: SkillProfileGenerationDto | undefined;
}): SkillGenerationState {
  if (mutationPending) return { status: "submitting" };
  if (mutationError) return { status: "error", message: mutationError.message };
  if (!generation) return { status: "idle" };

  return {
    status: generation.status,
    generationId: generation.generationId,
    selectedRepositoryCount: generation.progress.selectedRepositoryCount,
    snapshottedRepositoryCount: generation.progress.snapshottedRepositoryCount,
    skillCount: generation.skills.length,
    failureReason: generation.failureReason,
  };
}

function getGenerationStatusLabel(status: SkillProfileGenerationStatus): string {
  switch (status) {
    case "queued":
      return "في قائمة الانتظار";
    case "collecting_evidence":
      return "جمع الأدلة";
    case "analyzing":
      return "تحليل الأدلة";
    case "pending_review":
      return "بانتظار المراجعة";
    case "needs_more_evidence":
      return "الأدلة غير كافية";
    case "failed":
      return "فشل التحليل";
  }
}

export function toggleRepositorySelection(
  current: string[],
  fullName: string,
  maximum = MAX_SELECTED_REPOSITORIES,
): string[] {
  if (current.includes(fullName)) {
    return current.filter((item) => item !== fullName);
  }
  if (current.length >= maximum) {
    return current;
  }
  return [...current, fullName];
}

function isGitHubAccountNotConnectedError(error: Error | null) {
  return isAxiosError(error) && error.response?.status === 404;
}

function getLanguageEntries(
  languages: Record<string, number>,
): Array<[string, number]> {
  const entries = Object.entries(languages).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (total <= 0) return [];

  return entries
    .sort(([, firstBytes], [, secondBytes]) => secondBytes - firstBytes)
    .slice(0, 4)
    .map(([language, bytes]) => [
      language,
      Math.max(4, Math.round((bytes / total) * 100)),
    ]);
}

function formatDate(value: string | null) {
  if (!value) return "غير متاح";

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-EG").format(value);
}
