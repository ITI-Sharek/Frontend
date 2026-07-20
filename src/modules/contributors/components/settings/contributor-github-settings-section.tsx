import { Github, Loader2, Sparkles, Unlink } from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";

import type { ContributorProfileDto } from "../../types/contributor-profile.types";

/** Settings → "GitHub": connection status, connect flow, AI skills analysis trigger. */
export function ContributorGithubSettingsSection({
  profile,
  onConnectGitHub,
  onDisconnectGitHub,
  onOpenRepositories,
}: {
  profile: ContributorProfileDto;
  onConnectGitHub: () => Promise<void>;
  onDisconnectGitHub: () => Promise<void>;
  onOpenRepositories: () => void;
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
        {profile.githubStatus.connected ? (
          <div className="flex flex-wrap justify-end gap-2">
            <GitHubConnectButton
              label="تغيير الحساب"
              onConnectGitHub={onConnectGitHub}
            />
            <GitHubDisconnectButton onDisconnectGitHub={onDisconnectGitHub} />
          </div>
        ) : (
          <GitHubConnectButton
            label="ربط الحساب"
            onConnectGitHub={onConnectGitHub}
          />
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
        <SkillsGenerator
          disabled={!profile.githubStatus.connected}
          onOpenRepositories={onOpenRepositories}
        />
      </div>
    </div>
  );
}

function GitHubConnectButton({
  label,
  onConnectGitHub,
}: {
  label: string;
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
            <span>{label}</span>
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GitHubDisconnectButton({
  onDisconnectGitHub,
}: {
  onDisconnectGitHub: () => Promise<void>;
}) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    if (
      !window.confirm(
        "سيتم فصل وصول المستودعات وتسجيل الدخول عبر GitHub. هل تريد المتابعة؟",
      )
    ) {
      return;
    }

    setError(null);
    setIsDisconnecting(true);
    try {
      await onDisconnectGitHub();
    } catch (disconnectError) {
      setIsDisconnecting(false);
      setError(
        getApiErrorMessage(
          disconnectError,
          "تعذر فصل حساب GitHub. تأكد من وجود طريقة أخرى لتسجيل الدخول.",
        ),
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isDisconnecting}
        onClick={handleDisconnect}
      >
        {isDisconnecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Unlink className="size-4" />
        )}
        <span>{isDisconnecting ? "جارٍ الفصل..." : "فصل الحساب"}</span>
      </Button>
      {error && <p className="max-w-xs text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SkillsGenerator({
  disabled,
  onOpenRepositories,
}: {
  disabled: boolean;
  onOpenRepositories: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        size="sm"
        disabled={disabled}
        onClick={onOpenRepositories}
      >
        <Sparkles className="size-4" />
        <span>اختيار المستودعات وبدء التحليل</span>
      </Button>
      {disabled && (
        <p className="text-xs text-muted-foreground">
          اربط حساب GitHub أولاً لبدء التحليل.
        </p>
      )}
    </div>
  );
}
