import {
  Check,
  ChevronDown,
  FileText,
  Github,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";

import { useGenerateSkillsMutation } from "../api/mutations/use-generate-skills-mutation";
import { useUpdateProfileDetailsMutation } from "../api/mutations/use-update-profile-details-mutation";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

const KNOWN_PROMPTS = ["add_bio", "generate_skills", "connect_github"] as const;
type CompletionPrompt = (typeof KNOWN_PROMPTS)[number];

interface PromptMeta {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
}

const PROMPT_META: Record<CompletionPrompt, PromptMeta> = {
  add_bio: {
    icon: FileText,
    title: "أضف نبذة تعريفية",
    description: "ملخص قصير عن خبرتك وما تحب المساهمة فيه يظهر لأصحاب المشاريع.",
    actionLabel: "كتابة النبذة",
  },
  generate_skills: {
    icon: Sparkles,
    title: "ولّد ملفك المهاري",
    description:
      "نحلل نشاطك على GitHub لاستخراج مهارات موثقة بالأدلة، ثم يراجعها فريق المراجعة.",
    actionLabel: "بدء التحليل",
  },
  connect_github: {
    icon: Github,
    title: "اربط مستودعات GitHub",
    description:
      "هذا ربط منفصل بعد تسجيل الدخول يطلب صلاحية قراءة مستودعاتك لبناء مهارات موثقة.",
    actionLabel: "ربط المستودعات",
  },
};

function isKnownPrompt(prompt: string): prompt is CompletionPrompt {
  return (KNOWN_PROMPTS as readonly string[]).includes(prompt);
}

interface ContributorProfileCompletionProps {
  profile: ContributorProfileDto;
  onConnectGitHub: () => Promise<void>;
}

export function ContributorProfileCompletion({
  profile,
  onConnectGitHub,
}: ContributorProfileCompletionProps) {
  const prompts = profile.completionPrompts.filter(isKnownPrompt);
  const completedCount = KNOWN_PROMPTS.length - prompts.length;
  const [openPrompt, setOpenPrompt] = useState<CompletionPrompt | null>(null);

  if (profile.viewerRelationship !== "owner" || prompts.length === 0) {
    return null;
  }

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

      <div className="flex flex-col gap-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt}
            prompt={prompt}
            profile={profile}
            isOpen={openPrompt === prompt}
            onToggle={() =>
              setOpenPrompt((current) => (current === prompt ? null : prompt))
            }
            onConnectGitHub={onConnectGitHub}
          />
        ))}
      </div>
    </Card>
  );
}

function PromptCard({
  prompt,
  profile,
  isOpen,
  onToggle,
  onConnectGitHub,
}: {
  prompt: CompletionPrompt;
  profile: ContributorProfileDto;
  isOpen: boolean;
  onToggle: () => void;
  onConnectGitHub: () => Promise<void>;
}) {
  const meta = PROMPT_META[prompt];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "rounded-input border bg-card transition-colors",
        isOpen ? "border-primary/50" : "border-border",
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-right"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold text-foreground">{meta.title}</span>
          <span className="text-xs leading-5 text-muted-foreground">
            {meta.description}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border p-4">
          {prompt === "add_bio" && <BioEditor profile={profile} />}
          {prompt === "generate_skills" && <SkillsGenerator />}
          {prompt === "connect_github" && (
            <GitHubConnect onConnectGitHub={onConnectGitHub} />
          )}
        </div>
      )}
    </div>
  );
}

function BioEditor({ profile }: { profile: ContributorProfileDto }) {
  const mutation = useUpdateProfileDetailsMutation(profile);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [availability, setAvailability] = useState(profile.availability ?? "");

  const canSave = bio.trim().length > 0 && !mutation.isPending;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        mutation.mutate({ bio, availability: availability || null });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-bio" className="text-right">
          النبذة التعريفية
        </Label>
        <textarea
          id="profile-bio"
          dir="rtl"
          rows={4}
          maxLength={500}
          placeholder="مثال: مطور واجهات خلفية بخبرة في Node.js وPostgreSQL، أستمتع ببناء واجهات API نظيفة وأبحث عن مساهمات في مشاريع مفتوحة المصدر عربية."
          className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-left text-xs text-muted-foreground" dir="ltr">
          {bio.length}/500
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-availability" className="text-right">
          الإتاحة (اختياري)
        </Label>
        <input
          id="profile-availability"
          dir="rtl"
          placeholder="مثال: 10 ساعات أسبوعيًا — مساءً وعطلات"
          className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>

      {mutation.isError && (
        <p className="text-right text-xs text-destructive">
          {getApiErrorMessage(mutation.error, "تعذر حفظ النبذة. حاول مرة أخرى.")}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="submit" size="sm" disabled={!canSave}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>جارٍ الحفظ...</span>
            </>
          ) : mutation.isSuccess ? (
            <>
              <Check className="size-4" />
              <span>تم الحفظ</span>
            </>
          ) : (
            <span>حفظ</span>
          )}
        </Button>
      </div>
    </form>
  );
}

function SkillsGenerator() {
  const mutation = useGenerateSkillsMutation();

  if (mutation.isSuccess) {
    return (
      <div className="flex items-start gap-3 text-right">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Loader2 className="size-4 animate-spin" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">
            التحليل قيد التنفيذ
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {mutation.data.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-right">
      <ol className="flex flex-col gap-2 text-xs leading-5 text-muted-foreground">
        <li>١. نقرأ مستودعاتك العامة ونشاط المساهمات.</li>
        <li>٢. يستخرج الذكاء الاصطناعي المهارات مع أدلتها ومستوى الثقة.</li>
        <li>٣. يراجع فريق المراجعة النتائج قبل اعتمادها — لا شيء يُنشر تلقائيًا.</li>
      </ol>

      {mutation.isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(mutation.error, "تعذر بدء التحليل. حاول مرة أخرى.")}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        className="self-start"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>جارٍ البدء...</span>
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            <span>بدء التحليل</span>
          </>
        )}
      </Button>
    </div>
  );
}

function GitHubConnect({
  onConnectGitHub,
}: {
  onConnectGitHub: () => Promise<void>;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setIsStarting(true);
    try {
      await onConnectGitHub();
    } catch (connectError) {
      setIsStarting(false);
      setError(
        getApiErrorMessage(connectError, "تعذر فتح ربط GitHub. حاول مرة أخرى."),
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 text-right">
      <ul className="flex flex-col gap-2 text-xs leading-5 text-muted-foreground">
        <li>
          • نقرأ المستودعات العامة والخاصة واللغات ونشاط الالتزامات (commits)
          فقط.
        </li>
        <li>• لا نكتب أو نعدّل أي شيء في حسابك.</li>
        <li>• يمكنك فصل الحساب في أي وقت من الإعدادات.</li>
      </ul>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        type="button"
        size="sm"
        className="self-start"
        disabled={isStarting}
        onClick={handleConnect}
      >
        {isStarting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>جارٍ التحويل إلى GitHub...</span>
          </>
        ) : (
          <>
            <Github className="size-4" />
            <span>ربط المستودعات</span>
          </>
        )}
      </Button>
    </div>
  );
}
