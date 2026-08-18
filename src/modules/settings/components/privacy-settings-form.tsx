import {
  Check,
  Download,
  Globe,
  Loader2,
  Lock,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useExportAccountDataMutation, useUpdatePrivacyMutation  } from "@/modules/auth";
import type {AuthUserDto} from "@/modules/auth";
import type { ContributorProfileDto } from "@/modules/contributors";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";

interface PrivacySettingsFormProps {
  user: AuthUserDto;
  profile?: ContributorProfileDto;
}

export function PrivacySettingsForm({ user, profile }: PrivacySettingsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [showEmail, setShowEmail] = useState(user.showEmail ?? false);
  const [showPhone, setShowPhone] = useState(user.showPhone ?? false);
  const [showActivity, setShowActivity] = useState(user.showActivity ?? true);
  const [allowIndexing, setAllowIndexing] = useState(user.allowIndexing ?? true);
  const [saved, setSaved] = useState(false);
  const updatePrivacy = useUpdatePrivacyMutation();
  const exportData = useExportAccountDataMutation();
  const [visibility, setVisibility] = useState<"public" | "members" | "private">(
    user.profileVisibility ?? "public",
  );
  void profile;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updatePrivacy.mutate({ profileVisibility: visibility, showEmail, showPhone, showActivity, allowIndexing }, {
      onSuccess: () => setSaved(true),
    });
  }

  function handleDownloadData() {
    exportData.mutate(undefined, { onSuccess: (data) => {
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      downloadAnchor.download = "sharek-account-data.json";
      downloadAnchor.click(); URL.revokeObjectURL(downloadAnchor.href);
    }});
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.privacy.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.privacy.description")}
        </p>
      </div>

      {/* Profile Visibility Options */}
      <div className="flex flex-col gap-3.5">
        <Label className="text-sm font-semibold text-foreground">
          {t("settings.personal.privacy.visibility.title")}
        </Label>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {/* Public */}
          <button
            type="button"
            onClick={() => {
              setVisibility("public");
              setSaved(false);
            }}
            className={cn(
              "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-start transition-all",
              visibility === "public"
                ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  visibility === "public"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Globe className="size-4" />
              </span>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  visibility === "public"
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/40",
                )}
              >
                {visibility === "public" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {t("settings.personal.privacy.visibility.public")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("settings.personal.privacy.visibility.publicDesc")}
              </p>
            </div>
          </button>

          {/* Members only */}
          <button
            type="button"
            onClick={() => {
              setVisibility("members");
              setSaved(false);
            }}
            className={cn(
              "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-start transition-all",
              visibility === "members"
                ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  visibility === "members"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Users className="size-4" />
              </span>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  visibility === "members"
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/40",
                )}
              >
                {visibility === "members" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {t("settings.personal.privacy.visibility.members")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("settings.personal.privacy.visibility.membersDesc")}
              </p>
            </div>
          </button>

          {/* Private */}
          <button
            type="button"
            onClick={() => {
              setVisibility("private");
              setSaved(false);
            }}
            className={cn(
              "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-start transition-all",
              visibility === "private"
                ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  visibility === "private"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Lock className="size-4" />
              </span>
              <div
                className={cn(
                  "size-4 rounded-full border flex items-center justify-center",
                  visibility === "private"
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/40",
                )}
              >
                {visibility === "private" && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {t("settings.personal.privacy.visibility.private")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("settings.personal.privacy.visibility.privateDesc")}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy Toggles Checklist */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-foreground">
          {isArabic ? "خيارات ومحددات الخصوصية" : "Privacy & Sharing Options"}
        </Label>
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <Checkbox
              checked={showEmail}
              onCheckedChange={(checked) => {
                setShowEmail(checked === true);
                setSaved(false);
              }}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5 text-start">
              <span className="text-sm font-medium text-foreground">
                {t("settings.personal.privacy.toggles.email")}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <Checkbox
              checked={showPhone}
              onCheckedChange={(checked) => {
                setShowPhone(checked === true);
                setSaved(false);
              }}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5 text-start">
              <span className="text-sm font-medium text-foreground">
                {t("settings.personal.privacy.toggles.phone")}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <Checkbox
              checked={showActivity}
              onCheckedChange={(checked) => {
                setShowActivity(checked === true);
                setSaved(false);
              }}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5 text-start">
              <span className="text-sm font-medium text-foreground">
                {t("settings.personal.privacy.toggles.activity")}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40">
            <Checkbox
              checked={allowIndexing}
              onCheckedChange={(checked) => {
                setAllowIndexing(checked === true);
                setSaved(false);
              }}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5 text-start">
              <span className="text-sm font-medium text-foreground">
                {t("settings.personal.privacy.toggles.search")}
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Account Data Export */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Download className="size-4" />
          </span>
          <div>
            <p className="font-bold text-foreground">
              {t("settings.personal.privacy.data.title")}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("settings.personal.privacy.data.description")}
            </p>
          </div>
        </div>
        <div className="mt-2 flex justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exportData.isPending}
            onClick={handleDownloadData}
            className="gap-2 rounded-xl text-xs font-semibold"
          >
            {exportData.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>{t("settings.personal.privacy.data.download")}</span>
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={updatePrivacy.isPending}
          className="min-w-[190px] gap-2 rounded-xl text-sm font-semibold shadow-xs"
        >
          {updatePrivacy.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{isArabic ? "جارٍ الحفظ..." : "Saving..."}</span>
            </>
          ) : saved ? (
            <>
              <Check className="size-4 text-emerald-300" />
              <span>{t("settings.personal.privacy.saved")}</span>
            </>
          ) : (
            <>
              <Shield className="size-4" />
              <span>{t("settings.personal.privacy.save")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
