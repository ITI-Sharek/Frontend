import { Github, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";

import { useGenerateSkillsMutation } from "../../api/mutations/use-generate-skills-mutation";
import type { ContributorProfileDto } from "../../types/contributor-profile.types";

/** Settings → "GitHub": connection status, connect flow, AI skills analysis trigger. */
export function ContributorGithubSettingsSection({
  profile,
  onConnectGitHub,
}: {
  profile: ContributorProfileDto;
  onConnectGitHub: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 rounded-input border border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Github className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {profile.githubStatus.connected ? "متصل" : "غير متصل"}
            </p>
            {profile.githubStatus.connected && profile.githubStatus.username ? (
              <a
                dir="ltr"
                href={`https://github.com/${profile.githubStatus.username}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] tracking-[0.65px] text-primary hover:opacity-80"
              >
                @{profile.githubStatus.username}
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">
                اربط حسابك لبناء ملف مهاري موثق تلقائيًا.
              </p>
            )}
          </div>
        </div>
        {!profile.githubStatus.connected && (
          <GitHubConnectButton onConnectGitHub={onConnectGitHub} />
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-input border border-border p-4">
        <div>
          <p className="font-semibold text-foreground">تحليل المهارات بالذكاء الاصطناعي</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            نقرأ مستودعاتك ونشاطك على GitHub لاستخراج مهارات موثقة بالأدلة، ثم
            يراجعها فريق المراجعة قبل اعتمادها — لا شيء يُنشر تلقائيًا.
          </p>
        </div>
        <SkillsGenerator disabled={!profile.githubStatus.connected} />
      </div>
    </div>
  );
}

function GitHubConnectButton({
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
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" size="sm" disabled={isStarting} onClick={handleConnect}>
        {isStarting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>جارٍ التحويل...</span>
          </>
        ) : (
          <>
            <Github className="size-4" />
            <span>ربط الحساب</span>
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SkillsGenerator({ disabled }: { disabled: boolean }) {
  const mutation = useGenerateSkillsMutation();

  if (mutation.isSuccess) {
    return (
      <div className="flex items-start gap-3 text-right">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Loader2 className="size-4 animate-spin" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">التحليل قيد التنفيذ</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {mutation.data.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        size="sm"
        disabled={disabled || mutation.isPending}
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
      {disabled && (
        <p className="text-xs text-muted-foreground">
          اربط حساب GitHub أولاً لبدء التحليل.
        </p>
      )}
      {mutation.isError && (
        <p className="text-xs text-destructive">
          {getApiErrorMessage(mutation.error, "تعذر بدء التحليل. حاول مرة أخرى.")}
        </p>
      )}
    </div>
  );
}
