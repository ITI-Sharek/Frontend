import { Check, ChevronLeft, ChevronRight, FileText, Github, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Card } from "@/shared/components/ui/card";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

const KNOWN_PROMPTS = ["add_bio", "connect_github", "generate_skills"] as const;
type CompletionPrompt = (typeof KNOWN_PROMPTS)[number];

interface PromptMeta {
  icon: ComponentType<{ className?: string }>;
  titleKey: string;
  settingsSection: "profile" | "github";
}

const PROMPT_META: Record<CompletionPrompt, PromptMeta> = {
  add_bio: {
    icon: FileText,
    titleKey: "contributor.completion.promptAddBio",
    settingsSection: "profile",
  },
  generate_skills: {
    icon: Sparkles,
    titleKey: "contributor.completion.promptGenerateSkills",
    settingsSection: "github",
  },
  connect_github: {
    icon: Github,
    titleKey: "contributor.completion.promptConnectGithub",
    settingsSection: "github",
  },
};

function isKnownPrompt(prompt: string): prompt is CompletionPrompt {
  return (KNOWN_PROMPTS as readonly string[]).includes(prompt);
}

/**
 * A progress ring rather than a bar.
 *
 * Completion here is three discrete steps, not a continuous quantity, so the
 * ring is drawn as three separate arcs with a gap between them: you can count
 * what is left without reading the fraction. A bar would imply that being
 * two-thirds done is a smooth position rather than "one task remaining".
 */
function CompletionRing({ done, total }: { done: number; total: number }) {
  const size = 62;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  /* ~9% of the ring per gap, so adjacent completed steps stay countable. */
  const gap = circumference * 0.06;
  const arc = circumference / total - gap;

  return (
    <span className="relative inline-flex shrink-0" aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {Array.from({ length: total }).map((_, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              stroke={
                index < done ? "var(--primary)" : "var(--surface-muted)"
              }
              strokeDasharray={`${arc} ${circumference - arc}`}
              strokeDashoffset={-(index * (arc + gap)) - gap / 2}
            />
          ))}
        </g>
      </svg>
      <span className="tnum absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {done}/{total}
      </span>
    </span>
  );
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
  const { t, i18n } = useTranslation();
  const isRtl = !i18n.language.startsWith("en");
  if (profile.viewerRelationship !== "owner") return null;

  const incomplete = new Set(profile.completionPrompts.filter(isKnownPrompt));
  const completedCount = KNOWN_PROMPTS.length - incomplete.size;

  if (incomplete.size === 0) return null;

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Card tone="quiet" className="border-primary/25 bg-primary-soft">
      <div className="flex items-center gap-4">
        <CompletionRing done={completedCount} total={KNOWN_PROMPTS.length} />
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-snug text-foreground">
            {t("contributor.completion.title")}
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
            {t("contributor.completion.description")}
          </p>
        </div>
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {KNOWN_PROMPTS.map((prompt) => {
          const meta = PROMPT_META[prompt];
          const Icon = meta.icon;
          const isDone = !incomplete.has(prompt);

          return (
            <li
              key={prompt}
              data-spine={isDone ? "verified" : "neutral"}
              className={cn(
                "flex items-center justify-between gap-3 rounded-input rounded-s-sm border border-border bg-card p-3 ps-3.5",
                isDone && "opacity-70",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    isDone
                      ? "bg-evidence-soft text-evidence-teal"
                      : "bg-surface-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    "truncate text-sm",
                    isDone
                      ? "text-muted-foreground line-through decoration-1"
                      : "font-semibold text-foreground",
                  )}
                >
                  {t(meta.titleKey)}
                </span>
              </span>

              {isDone ? (
                <Check className="size-4 shrink-0 text-evidence-teal" />
              ) : (
                <Link
                  to={ROUTES.settings}
                  search={{ section: meta.settingsSection }}
                  className="group/link flex shrink-0 items-center gap-0.5 rounded-input px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  {t("contributor.completion.completeLink")}
                  <Chevron className="size-4 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
