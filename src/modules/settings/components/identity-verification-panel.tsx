import {
  BadgeCheck,
  CheckCircle2,
  FileCheck,
  FileUp,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUploadIdentityDocumentMutation, type AuthUserDto } from "@/modules/auth";
import type { ContributorProfileDto } from "@/modules/contributors";

interface IdentityVerificationPanelProps {
  user: AuthUserDto;
  profile?: ContributorProfileDto;
}

export function IdentityVerificationPanel({
  user,
  profile,
}: IdentityVerificationPanelProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const uploadDocument = useUploadIdentityDocumentMutation();
  const isVerified = user.identityVerificationStatus === "verified";
  void profile;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadDocument.mutate(file, { onSuccess: () => setUploadSuccess(true) });
  }

  const perks = [
    t("settings.personal.identity.perks.item1"),
    t("settings.personal.identity.perks.item2"),
    t("settings.personal.identity.perks.item3"),
    t("settings.personal.identity.perks.item4"),
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.identity.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.identity.description")}
        </p>
      </div>

      {/* Verification Status Hero Card */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${
        isVerified
          ? "border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/20"
          : "border-border/80 bg-muted/20"
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs ${
              isVerified ? "bg-emerald-500" : "bg-muted-foreground"
            }`}>
              <BadgeCheck className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {isVerified
                    ? t("settings.personal.identity.verified")
                    : isArabic
                      ? "غير موثّق"
                      : "Not verified"}
                </h3>
                {isVerified && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {t("settings.personal.identity.verifiedBadge")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isVerified
                  ? t("settings.personal.identity.verifiedDesc")
                  : isArabic
                    ? "لم يتم التحقق من هويتك بعد."
                    : "Your identity has not been verified yet."}
              </p>
              {isVerified && (
                <p
                  dir="ltr"
                  className="mt-2 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  {t("settings.personal.identity.idRef")}
                </p>
              )}
            </div>
          </div>

          {isVerified && (
            <span className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-emerald-500/30 bg-background/80 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 sm:self-center">
              <CheckCircle2 className="size-4" />
              <span>{isArabic ? "موثّق ومعتمد" : "Verified & Active"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Verified Perks Grid */}
      {isVerified && <div className="flex flex-col gap-3">
        <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Sparkles className="size-4 text-primary" />
          <span>{t("settings.personal.identity.perks.title")}</span>
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {perks.map((perk, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-xs text-foreground shadow-2xs"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span className="leading-5">{perk}</span>
            </div>
          ))}
        </div>
      </div>}

      {/* Document Update / Re-verification */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
        <div>
          <h4 className="text-sm font-bold text-foreground">
            {t("settings.personal.identity.updateDoc.title")}
          </h4>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("settings.personal.identity.updateDoc.desc")}
          </p>
        </div>

        {uploadSuccess ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            <FileCheck className="size-5 shrink-0" />
            <span>
              {isArabic
                ? "اختيار المستند جاهز، لكن الرفع غير متاح بعد."
                : "Your document is selected, but uploads are not available yet."}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/50 p-6 text-center transition-colors hover:border-primary/50">
            <FileUp className="size-8 text-muted-foreground" />
            <p className="mt-2 text-xs font-bold text-foreground">
              {t("settings.personal.identity.updateDoc.uploadButton")}
            </p>
            <p className="mt-1 max-w-sm text-2xs text-muted-foreground">
              {t("settings.personal.identity.updateDoc.hint")}
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
              {uploadDocument.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileUp className="size-4" />
              )}
              <span>
                {uploadDocument.isPending
                  ? isArabic
                    ? "جارٍ الرفع..."
                    : "Uploading..."
                  : isArabic
                    ? "اختيار ملف المستند"
                    : "Choose document file"}
              </span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="sr-only"
                disabled={uploadDocument.isPending}
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        <div className="flex items-center gap-2 text-2xs text-muted-foreground">
          <LockKeyhole className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            {isArabic
              ? "مستنداتك مشفرة بتشفير AES-256 ولن يتم مشاركتها مطلقًا مع أي طرف ثالث."
              : "Your documents are encrypted using AES-256 and never shared with third parties."}
          </span>
        </div>
      </div>
    </div>
  );
}
