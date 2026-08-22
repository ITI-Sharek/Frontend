import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Github,
  Globe,
  Layers,
  LogIn,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import type { PublicProjectDetailDto } from "../types/public-project.types";

export interface TaskItemData {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  dueDate: string;
  reward: string;
  status: "open" | "in_progress" | "completed";
}

export interface ApplicationSubmissionPayload {
  contributionRequestId: string;
  params: {
    contributionApproach: string;
    proposedDeliveryDurationDays: number;
    idempotencyKey: string;
  };
}

/**
 * Owned by the route (which composes the `contribution-requests` module) and
 * passed down so this module never imports another module at runtime.
 */
export interface ApplicationSubmissionController {
  submit: (
    payload: ApplicationSubmissionPayload,
    handlers?: { onSuccess?: () => void },
  ) => void;
  reset: () => void;
  isPending: boolean;
  hasError: boolean;
  errorCode: string | null;
  submissionErrorMessage: string | null;
  dailyLimitResetCopy: string | null;
}

interface ApplyProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: PublicProjectDetailDto;
  tasks: TaskItemData[];
  initialTask?: TaskItemData | null;
  applicationSubmission: ApplicationSubmissionController;
  isAuthenticated: boolean;
  isContributor: boolean;
  isAuthLoading: boolean;
}

export function ApplyProjectDialog({
  open,
  onOpenChange,
  project,
  tasks,
  initialTask,
  applicationSubmission,
  isAuthenticated,
  isContributor,
  isAuthLoading,
}: ApplyProjectDialogProps) {
  const { t } = useTranslation();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [coverNote, setCoverNote] = useState("");
  const [deliveryDurationDays, setDeliveryDurationDays] = useState("14");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTaskId(initialTask?.id ?? (tasks.length > 0 ? tasks[0].id : ""));
  }, [initialTask, tasks]);

  useEffect(() => {
    if (open) {
      applicationSubmission.reset();
      setValidationError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;

    const trimmedCoverNote = coverNote.trim();
    if (trimmedCoverNote.length < 10) {
      setValidationError(
        t(
          "project.detail.approachMinLength",
          "Please provide at least 10 characters explaining your contribution approach.",
        ),
      );
      return;
    }

    setValidationError(null);
    applicationSubmission.submit(
      {
        contributionRequestId: selectedTaskId,
        params: {
          contributionApproach: trimmedCoverNote,
          proposedDeliveryDurationDays: Number(deliveryDurationDays),
          idempotencyKey: crypto.randomUUID(),
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          window.setTimeout(() => {
            setSubmitted(false);
            onOpenChange(false);
            setCoverNote("");
          }, 1600);
        },
      },
    );
  };

  const errorCode = applicationSubmission.errorCode;
  const errorMessage = applicationSubmission.hasError
    ? errorCode === "APPLICATION_BLOCKED_SKILL_GAP"
      ? t(
          "project.detail.skillGapBlocked",
          "Your skill profile does not currently meet the required skills for this request.",
        )
      : applicationSubmission.submissionErrorMessage
    : null;

  const resetCopy =
    errorCode === "APPLICATION_DAILY_LIMIT_REACHED"
      ? applicationSubmission.dailyLimitResetCopy
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-xl">
              {t("project.detail.applyToProject", "Apply to Project")}
            </DialogTitle>
            <DialogDescription>
              {project.title}
              {project.source.attributionStatus === "public"
                ? ` • ${project.source.fullName}`
                : ""}
            </DialogDescription>
          </div>
        </DialogHeader>

        {!isAuthLoading && !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">
              {t("project.detail.signInRequiredTitle", "Sign in required")}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {t(
                "project.detail.signInRequiredDesc",
                "You must be signed in with an active contributor account to apply for this project.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="gap-2">
                <a href={ROUTES.login}>
                  <LogIn className="size-4" />
                  {t("project.detail.signInToApply", "Sign in to apply")}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={ROUTES.register}>
                  {t("auth.registerTab", "Register")}
                </a>
              </Button>
            </div>
          </div>
        ) : !isAuthLoading && !isContributor ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">
              {t("project.detail.contributorOnlyTitle", "Contributor account required")}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {t(
                "project.detail.contributorOnlyDesc",
                "Applying for contribution requests is only available for active contributor accounts.",
              )}
            </p>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline">
                  {t("common.close", "Close")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">
              {t("project.detail.applicationSent", "Application Submitted!")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "project.detail.applicationSentNote",
                "The project owner has received your application and will review your profile shortly.",
              )}
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            {t("project.detail.noOpenTasks", "No open Contribution Requests right now.")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="apply-scope" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("project.detail.applicationScope", "Application Scope")}
              </Label>
              <select
                id="apply-scope"
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  applicationSubmission.reset();
                  setValidationError(null);
                }}
                className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("project.detail.coverNote", "Why are you a great fit for this project?")}
              </Label>
              <Textarea
                id="cover-note"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                value={coverNote}
                onChange={(e) => {
                  setCoverNote(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={t(
                  "project.detail.coverPlaceholder",
                  "Mention your experience with the required tech stack (Next.js, TypeScript, PostgreSQL) and similar projects you've built...",
                )}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("project.detail.proposedDeliveryDuration", "Proposed delivery duration")}
                </Label>
                <select
                  id="hours"
                  value={deliveryDurationDays}
                  onChange={(e) => setDeliveryDurationDays(e.target.value)}
                  className="w-full rounded-input border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
            </div>

            {(validationError || applicationSubmission.hasError) && (
              <div className="rounded-input border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {validationError || errorMessage}
                    </p>
                    {resetCopy && (
                      <p className="text-xs text-destructive/80">
                        {resetCopy}
                      </p>
                    )}
                    {errorCode === "APPLICATION_BLOCKED_SKILL_GAP" && (
                      <p className="text-xs text-destructive/80">
                        {t(
                          "project.detail.skillGapHelp",
                          "Review the required skills on this request or update your skill profile to proceed.",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common.cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" className="gap-2" disabled={applicationSubmission.isPending}>
                <Send className="size-4" />
                {t("project.detail.submitApplication", "Submit Application")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TaskDetailDialogProps {
  task: TaskItemData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (task: TaskItemData) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onApply,
}: TaskDetailDialogProps) {
  const { t } = useTranslation();
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {task.status.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                Due: {task.dueDate}
              </span>
            </div>
            <DialogTitle className="mt-1 text-xl">{task.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-3 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {task.description ?? t("project.detail.taskDescriptionUnavailable", "No description is available in this project summary.")}
          </p>

          <div className="rounded-card border border-border bg-surface-fog p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("project.detail.taskRequirements", "Required Skills & Specs")}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-social border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-card border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{t("project.detail.reward", "Reward")}</p>
              <p className="text-lg font-bold text-foreground">{task.reward}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">{t("common.close", "Close")}</Button>
          </DialogClose>
          <Button
            onClick={() => {
              onOpenChange(false);
              onApply(task);
            }}
            className="gap-2"
          >
            <Sparkles className="size-4" />
            {t("project.detail.applyForTask", "Apply for this Task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: PublicProjectDetailDto;
}

export function ShareProjectDialog({
  open,
  onOpenChange,
  project,
}: ShareProjectDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://share-k.com/projects/${project.slug}`;

  const handleCopy = () => {
    void navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => undefined,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("project.detail.shareProjectTitle", "Share Project")}</DialogTitle>
          <DialogDescription>
            {t("project.detail.shareProjectDesc", "Share this project with your team or social network")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input readOnly value={shareUrl} className="font-mono text-xs" />
            <Button
              type="button"
              variant={copied ? "primary" : "outline"}
              onClick={handleCopy}
              className="shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  {t("common.copied", "Copied")}
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  {t("common.copy", "Copy")}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${project.title} on Sharek!`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-fog"
            >
              <Globe className="size-3.5" />
              Twitter / X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-fog"
            >
              <ExternalLink className="size-3.5" />
              LinkedIn
            </a>
            {project.source.attributionStatus === "public" && (
              <a
                href={project.source.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-fog"
              >
                <Github className="size-3.5" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
