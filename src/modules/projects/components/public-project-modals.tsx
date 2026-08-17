import {
  Check,
  Copy,
  ExternalLink,
  Github,
  Globe,
  Layers,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
import { useSubmitApplicationMutation } from "@/modules/contribution-requests";

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

interface ApplyProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: PublicProjectDetailDto;
  tasks: TaskItemData[];
  initialTask?: TaskItemData | null;
}

export function ApplyProjectDialog({
  open,
  onOpenChange,
  project,
  tasks,
  initialTask,
}: ApplyProjectDialogProps) {
  const { t } = useTranslation();
  const submitApplication = useSubmitApplicationMutation();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [coverNote, setCoverNote] = useState("");
  const [deliveryDurationDays, setDeliveryDurationDays] = useState("14");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedTaskId(initialTask?.id ?? (tasks.length > 0 ? tasks[0].id : ""));
  }, [initialTask, tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    submitApplication.mutate(
      {
        contributionRequestId: selectedTaskId,
        params: {
          contributionApproach: coverNote,
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

        {submitted ? (
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
                onChange={(e) => setSelectedTaskId(e.target.value)}
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
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
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

            {submitApplication.isError && (
              <p className="text-sm text-destructive">
                {t("project.detail.applicationFailed", "Your application could not be submitted. Please sign in and try again.")}
              </p>
            )}

            <DialogFooter className="pt-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common.cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" className="gap-2" disabled={submitApplication.isPending}>
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
