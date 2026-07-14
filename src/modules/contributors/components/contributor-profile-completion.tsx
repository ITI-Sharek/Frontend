import { ChevronLeft, Check, FileText, Github, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { ROUTES } from "@/config/routes.config";
import { Card } from "@/shared/components/ui/card";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

const KNOWN_PROMPTS = ["add_bio", "connect_github", "generate_skills"] as const;
type CompletionPrompt = (typeof KNOWN_PROMPTS)[number];

interface PromptMeta {
  icon: ComponentType<{ className?: string }>;
  title: string;
  settingsSection: "profile" | "github";
}

const PROMPT_META: Record<CompletionPrompt, PromptMeta> = {
  add_bio: {
    icon: FileText,
    title: "أضف نبذة تعريفية",
    settingsSection: "profile",
  },
  generate_skills: {
    icon: Sparkles,
    title: "ولّد ملفك المهاري",
    settingsSection: "github",
  },
  connect_github: {
    icon: Github,
    title: "اربط مستودعات GitHub",
    settingsSection: "github",
  },
};

function isKnownPrompt(prompt: string): prompt is CompletionPrompt {
  return (KNOWN_PROMPTS as readonly string[]).includes(prompt);
}

/**
 * Status checklist only — every item links to the relevant /settings
 * section for the actual edit (per DEC: profile completion is a status
 * summary, not an inline editor).
 */
export function ContributorProfileCompletion({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  if (profile.viewerRelationship !== "owner") return null;

  const incomplete = new Set(profile.completionPrompts.filter(isKnownPrompt));
  const completedCount = KNOWN_PROMPTS.length - incomplete.size;

  if (incomplete.size === 0) return null;

  return (
    <Card className="flex flex-col gap-5 border-primary/40 bg-primary/5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">أكمل ملفك</h2>
          <span className="text-sm font-semibold text-primary">
            {completedCount} من {KNOWN_PROMPTS.length}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={KNOWN_PROMPTS.length}
          aria-valuenow={completedCount}
          aria-label="اكتمال الملف"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${(completedCount / KNOWN_PROMPTS.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          الملفات المكتملة تحصل على فرص مطابقة أفضل مع طلبات المساهمة.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {KNOWN_PROMPTS.map((prompt) => {
          const meta = PROMPT_META[prompt];
          const Icon = meta.icon;
          const isDone = !incomplete.has(prompt);

          return (
            <div
              key={prompt}
              className="flex items-center justify-between gap-3 rounded-input border border-border bg-card p-3.5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={
                    isDone
                      ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                      : "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  }
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={
                    isDone
                      ? "truncate text-sm text-muted-foreground line-through"
                      : "truncate text-sm font-medium text-foreground"
                  }
                >
                  {meta.title}
                </span>
              </span>

              {isDone ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <Link
                  to={ROUTES.settings}
                  search={{ section: meta.settingsSection }}
                  className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"
                >
                  إكمال
                  <ChevronLeft className="size-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
