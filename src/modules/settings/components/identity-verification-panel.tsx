import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  FileUp,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useUploadIdentityDocumentMutation } from "@/modules/auth";
import type { AuthUserDto } from "@/modules/auth";
import type { ContributorProfileDto } from "@/modules/contributors";
import { Button } from "@/shared/components/ui/button";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDocument = useUploadIdentityDocumentMutation();

  void profile;

  const currentStatus = uploadSuccess
    ? "pending"
    : (user.identityVerificationStatus ?? "unverified");

  const isVerified = currentStatus === "verified";
  const isPending = currentStatus === "pending";
  const isRejected = currentStatus === "rejected";
  const isUnverified = currentStatus === "unverified";

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        isArabic
          ? "حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت)."
          : "File size exceeds the 10MB limit.",
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmitUpload() {
    if (!selectedFile) return;

    setUploadError(null);
    uploadDocument.mutate(selectedFile, {
      onSuccess: () => {
        setUploadSuccess(true);
        setSelectedFile(null);
      },
      onError: (error) => {
        setUploadError(
          getApiErrorMessage(
            error,
            isArabic
              ? "فشل في رفع مستند الهوية. يرجى التأكد من أن الملف هو PDF أو PNG أو JPEG وبحجم أقل من 10 ميجابايت."
              : "Failed to upload document. Please ensure it is a PDF, PNG, or JPEG under 10MB.",
          ),
        );
      },
    });
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
      {isVerified && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-6 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs">
                <BadgeCheck className="size-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {t("settings.personal.identity.verified")}
                  </h3>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {t("settings.personal.identity.verifiedBadge")}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t("settings.personal.identity.verifiedDesc")}
                </p>
                <p
                  dir="ltr"
                  className="mt-2 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  {t("settings.personal.identity.idRef")}
                </p>
              </div>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-emerald-500/30 bg-background/80 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 sm:self-center">
              <CheckCircle2 className="size-4" />
              <span>{isArabic ? "موثّق ومعتمد" : "Verified & Active"}</span>
            </span>
          </div>
        </div>
      )}

      {isPending && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-50/50 p-6 dark:border-amber-500/20 dark:bg-amber-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                <Clock className="size-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {isArabic ? "طلب التوثيق قيد المراجعة" : "Verification Under Review"}
                  </h3>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {isArabic ? "قيد المراجعة" : "Pending Review"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground max-w-xl">
                  {isArabic
                    ? "تم استلام مستند الهوية الخاص بك بنجاح وهو قيد المراجعة حالياً من قبل فريق الإدارة. ستتلقى إشعاراً عبر البريد الإلكتروني فور الانتهاء من المراجعة."
                    : "Your identity document has been received and is currently being reviewed by our administration team. You will be notified via email once the review is completed."}
                </p>
              </div>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-amber-500/30 bg-background/80 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 sm:self-center">
              <Clock className="size-4" />
              <span>{isArabic ? "جارٍ التدقيق" : "In Review"}</span>
            </span>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-red-50/50 p-6 dark:border-red-500/20 dark:bg-red-950/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-xs">
                <XCircle className="size-6" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {isArabic ? "تم رفض طلب التوثيق" : "Verification Rejected"}
                  </h3>
                  <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                    {isArabic ? "مرفوض" : "Rejected"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {isArabic
                    ? "لم نتمكن من توثيق هويتك بناءً على المستند المقدم. يرجى الاطلاع على سبب الرفض أدناه وإعادة رفع مستند واضح."
                    : "We were unable to verify your identity with the submitted document. Please review the reason below and submit a clear document."}
                </p>

                {user.identityVerificationRejectedReason && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-white p-3.5 text-xs text-red-900 shadow-2xs dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    <p className="font-bold">
                      {isArabic ? "سبب الرفض:" : "Rejection Reason:"}
                    </p>
                    <p className="mt-1 text-red-800 dark:text-red-300 leading-relaxed">
                      {user.identityVerificationRejectedReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isUnverified && (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted-foreground/60 text-white shadow-xs">
              <BadgeCheck className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {isArabic ? "الهوية غير موثّقة" : "Identity Not Verified"}
                </h3>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                  {isArabic ? "غير موثّق" : "Unverified"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isArabic
                  ? "قم بتوثيق هويتك الوطنية للحصول على شارة التوثيق الرسمية وزيادة مصداقيتك في مجتمع المنصة."
                  : "Verify your national identity to earn the verified badge and build trust across the community."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verified Perks Grid */}
      {isVerified && (
        <div className="flex flex-col gap-3">
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
        </div>
      )}

      {/* Document Upload / Re-verification Section (Shown when unverified, rejected, or updating) */}
      {!isVerified && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {isRejected
                ? isArabic
                  ? "إعادة تقديم مستند الهوية"
                  : "Re-submit Identity Document"
                : isArabic
                  ? "رفع مستند الهوية الرسمية"
                  : "Upload Identity Document"}
            </h4>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {isRejected
                ? isArabic
                  ? "يرجى رفع صورة واضحة وعالية الجودة لبطاقة الهوية الوطنية أو جواز السفر."
                  : "Please upload a clear, high-quality image of your national ID or passport."
                : isArabic
                  ? "اختر ملف المستند (PDF أو PNG أو JPG) ثم اضغط على زر إرسال الطلب للمراجعة."
                  : "Select your document (PDF, PNG, or JPG) and click submit for review."}
            </p>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <FileCheck className="size-5 shrink-0" />
              <span>
                {isArabic
                  ? "تم رفع مستند الهوية بنجاح وهو الآن قيد المراجعة من قِبل الإدارة."
                  : "Your identity document has been uploaded successfully and is now under review."}
              </span>
            </div>
          ) : selectedFile ? (
            /* Selected File Card with explicit Submit button */
            <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-foreground truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploadDocument.isPending}
                  className="size-8 p-0 text-muted-foreground hover:text-destructive"
                  title={isArabic ? "إلغاء واختيار ملف آخر" : "Remove and select another file"}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-primary/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploadDocument.isPending}
                  className="rounded-xl text-xs font-semibold"
                >
                  <span>{isArabic ? "إلغاء" : "Cancel"}</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitUpload}
                  disabled={uploadDocument.isPending}
                  className="gap-2 rounded-xl text-xs font-bold"
                >
                  {uploadDocument.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>
                    {uploadDocument.isPending
                      ? isArabic
                        ? "جارٍ الرفع والإرسال..."
                        : "Uploading & Submitting..."
                      : isArabic
                        ? "إرسال مستند الهوية للمراجعة"
                        : "Submit Document for Review"}
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            /* File Dropzone / Picker */
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/50 p-6 text-center transition-colors hover:border-primary/50">
              <FileUp className="size-8 text-muted-foreground" />
              <p className="mt-2 text-xs font-bold text-foreground">
                {isArabic ? "رفع مستند الهوية (بطاقة هوية / جواز سفر)" : "Upload ID Document"}
              </p>
              <p className="mt-1 max-w-sm text-2xs text-muted-foreground">
                {isArabic
                  ? "الملفات المدعومة: PDF, PNG, JPG بحد أقصى 10 ميجابايت"
                  : "Supported files: PDF, PNG, JPG up to 10MB"}
              </p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
                {isRejected ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <FileUp className="size-4" />
                )}
                <span>
                  {isRejected
                    ? isArabic
                      ? "اختيار مستند جديد لإعادة التوثيق"
                      : "Choose new document to re-verify"
                    : isArabic
                      ? "اختيار ملف المستند"
                      : "Choose document file"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  className="sr-only"
                  onChange={handleFileSelect}
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
      )}
    </div>
  );
}
