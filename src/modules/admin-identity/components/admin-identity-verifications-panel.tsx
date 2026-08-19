import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import { useAdminIdentityVerificationsQuery } from "../api/queries/use-admin-identity-verifications-query";
import { useAdminIdentityReviewMutation } from "../api/mutations/use-admin-identity-review-mutation";
import { getAdminIdentityDocumentBlob } from "../services/admin-identity.service";
import type { AdminIdentityVerificationItemDto } from "../types/admin-identity.types";

export function AdminIdentityVerificationsPanel() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] =
    useState<AdminIdentityVerificationItemDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingMode, setRejectingMode] = useState(false);

  // Document Blob Preview State
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentMimeType, setDocumentMimeType] = useState<string | null>(null);
  const [documentFilename, setDocumentFilename] = useState<string | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [documentLoadError, setDocumentLoadError] = useState<string | null>(null);

  const verificationsQuery = useAdminIdentityVerificationsQuery({
    status: statusFilter,
    limit: 50,
  });
  const reviewMutation = useAdminIdentityReviewMutation();

  // Load document blob securely when selected user changes
  useEffect(() => {
    if (!selectedUser) {
      setDocumentBlobUrl(null);
      setDocumentMimeType(null);
      setDocumentFilename(null);
      setDocumentLoadError(null);
      return;
    }

    let isCancelled = false;
    let currentBlobUrl: string | null = null;

    setIsDocumentLoading(true);
    setDocumentLoadError(null);

    getAdminIdentityDocumentBlob(selectedUser.id)
      .then(({ blob, mimeType, filename }) => {
        if (isCancelled) return;
        currentBlobUrl = URL.createObjectURL(blob);
        setDocumentBlobUrl(currentBlobUrl);
        setDocumentMimeType(mimeType);
        setDocumentFilename(filename);
        setIsDocumentLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setDocumentLoadError(
          getApiErrorMessage(
            err,
            isArabic
              ? "تعذر تحميل مستند الهوية من الخادم."
              : "Could not load document from server.",
          ),
        );
        setIsDocumentLoading(false);
      });

    return () => {
      isCancelled = true;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [selectedUser, isArabic]);

  const allItems = verificationsQuery.data?.items ?? [];
  const filteredItems = allItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.firstName.toLowerCase().includes(term) ||
      item.lastName.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      (item.username && item.username.toLowerCase().includes(term))
    );
  });

  const pendingCount =
    statusFilter === "pending"
      ? (verificationsQuery.data?.total ?? 0)
      : allItems.filter((i) => i.identityVerificationStatus === "pending").length;

  async function handleApprove(userId: string) {
    await reviewMutation.mutateAsync({
      userId,
      payload: { decision: "verified" },
    });
    setSelectedUser(null);
    setRejectingMode(false);
  }

  async function handleReject(userId: string) {
    if (!rejectionReason.trim()) return;
    await reviewMutation.mutateAsync({
      userId,
      payload: { decision: "rejected", reason: rejectionReason.trim() },
    });
    setSelectedUser(null);
    setRejectingMode(false);
    setRejectionReason("");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <Shield className="size-6 text-primary" />
            <span>{isArabic ? "مراجعة توثيق الهويات" : "Identity Verifications"}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isArabic
              ? "مراجعة واعتماد أو رفض مستندات الهوية الوطنية المرفوعة من قبل المستخدمين."
              : "Review, approve, or reject national identity documents submitted by users."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void verificationsQuery.refetch()}
          disabled={verificationsQuery.isFetching}
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw
            className={`size-3.5 ${verificationsQuery.isFetching ? "animate-spin" : ""}`}
          />
          <span>{isArabic ? "تحديث" : "Refresh"}</span>
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "pending", labelEn: "Pending", labelAr: "قيد المراجعة", count: pendingCount },
              { id: "all", labelEn: "All", labelAr: "الكل" },
              { id: "verified", labelEn: "Verified", labelAr: "موثّق" },
              { id: "rejected", labelEn: "Rejected", labelAr: "مرفوض" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              {tab.id === "pending" && pendingCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                    statusFilter === "pending"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabic ? "بحث بالاسم أو البريد..." : "Search users..."}
            className="h-9 w-full rounded-xl border border-border bg-background ps-8 pe-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Verifications List Table / Empty State */}
      {verificationsQuery.isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border/80 bg-card p-12">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p>{isArabic ? "جارٍ تحميل الطلبات..." : "Loading verifications..."}</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card p-12 text-center">
          <Inbox className="size-10 text-muted-foreground/60" />
          <h3 className="text-base font-bold text-foreground">
            {isArabic ? "لا توجد طلبات توثيق" : "No identity verifications found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {isArabic
              ? "لا توجد أي طلبات تطابق الفلتر الحالي. يمكنك تغيير الفلتر أو البحث عن مستخدم آخر."
              : "There are no identity verification requests matching your selected filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
          <table className="w-full border-collapse text-start text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-start font-semibold text-muted-foreground">
                <th className="px-5 py-3.5 text-start">{isArabic ? "المستخدم" : "User"}</th>
                <th className="px-4 py-3.5 text-start">{isArabic ? "الدور" : "Role"}</th>
                <th className="px-4 py-3.5 text-start">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3.5 text-start">{isArabic ? "تاريخ الرفع" : "Uploaded"}</th>
                <th className="px-5 py-3.5 text-end">{isArabic ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.map((item) => {
                const displayName = `${item.firstName} ${item.lastName}`.trim();
                const isItemPending = item.identityVerificationStatus === "pending";
                const isItemVerified = item.identityVerificationStatus === "verified";
                const isItemRejected = item.identityVerificationStatus === "rejected";

                return (
                  <tr key={item.id} className="transition-colors hover:bg-muted/20">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={item.avatarUrl}
                          alt={displayName}
                          size="sm"
                          fallback={displayName.slice(0, 2).toUpperCase()}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{displayName}</span>
                          <span dir="ltr" className="font-mono text-2xs text-muted-foreground">
                            {item.email}
                          </span>
                          {item.username && (
                            <span dir="ltr" className="font-mono text-2xs text-primary">
                              @{item.username}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className="capitalize text-muted-foreground">{item.role}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {isItemPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          <Clock className="size-3" />
                          <span>{isArabic ? "قيد المراجعة" : "Pending"}</span>
                        </span>
                      )}
                      {isItemVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          <span>{isArabic ? "موثّق" : "Verified"}</span>
                        </span>
                      )}
                      {isItemRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                          <XCircle className="size-3" />
                          <span>{isArabic ? "مرفوض" : "Rejected"}</span>
                        </span>
                      )}
                      {!isItemPending && !isItemVerified && !isItemRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          <span>{isArabic ? "غير موثّق" : "Unverified"}</span>
                        </span>
                      )}
                    </td>

                    {/* Uploaded At */}
                    <td className="px-4 py-4 text-muted-foreground">
                      {item.identityDocumentUpdatedAt
                        ? new Date(item.identityDocumentUpdatedAt).toLocaleDateString(
                            isArabic ? "ar-SA" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-end">
                      <Button
                        variant={isItemPending ? "primary" : "outline"}
                        size="sm"
                        className="gap-1.5 rounded-xl text-xs font-semibold"
                        onClick={() => {
                          setSelectedUser(item);
                          setRejectingMode(false);
                          setRejectionReason(item.identityVerificationRejectedReason ?? "");
                        }}
                      >
                        <Eye className="size-3.5" />
                        <span>
                          {isItemPending
                            ? isArabic
                              ? "مراجعة"
                              : "Review"
                            : isArabic
                              ? "عرض"
                              : "View"}
                        </span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Dialog */}
      {selectedUser && (
        <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-3xl overflow-hidden p-0">
            <DialogHeader className="border-b border-border/80 p-6 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {isArabic ? "مراجعة مستند الهوية" : "Review Identity Document"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs text-muted-foreground">
                    {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                  </DialogDescription>
                </div>

                {documentBlobUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={documentBlobUrl}
                      download={documentFilename || "identity-document"}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <Download className="size-3.5" />
                      <span>{isArabic ? "تحميل" : "Download"}</span>
                    </a>
                    <a
                      href={documentBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>{isArabic ? "فتح في نافذة جديدة" : "Open in new tab"}</span>
                    </a>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Document Viewer Container */}
            <div className="flex flex-col gap-4 p-6">
              <div className="relative flex min-h-[380px] max-h-[520px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2">
                {isDocumentLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <span className="text-xs">
                      {isArabic ? "جارٍ تحميل المستند بأمان..." : "Loading document securely..."}
                    </span>
                  </div>
                ) : documentLoadError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-destructive">
                    <AlertCircle className="size-8" />
                    <span className="text-xs font-semibold">{documentLoadError}</span>
                  </div>
                ) : documentBlobUrl ? (
                  documentMimeType?.includes("pdf") ? (
                    <iframe
                      src={documentBlobUrl}
                      title="Identity Document"
                      className="size-full min-h-[420px] rounded-xl border border-border bg-white"
                    />
                  ) : (
                    <img
                      src={documentBlobUrl}
                      alt="Identity Document"
                      className="max-h-[460px] max-w-full rounded-xl object-contain shadow-xs bg-white"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                    <AlertCircle className="size-6" />
                    <span className="text-xs">
                      {isArabic ? "لا يوجد مستند متوفر." : "No document available."}
                    </span>
                  </div>
                )}
              </div>

              {/* Review Action Controls */}
              {rejectingMode ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-950/20">
                  <Label htmlFor="rejection-reason" className="text-xs font-bold text-red-900 dark:text-red-200">
                    {isArabic ? "سبب الرفض (سيتم إرساله للمستخدم):" : "Rejection Reason (will be emailed to user):"} *
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      isArabic
                        ? "مثال: الصورة غير واضحة، أو المستند منتهي الصلاحية، أو الاسم لا يتطابق..."
                        : "e.g., Unclear photo, expired ID, name mismatch..."
                    }
                    className="min-h-20 text-xs bg-background"
                    required
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRejectingMode(false)}
                      disabled={reviewMutation.isPending}
                    >
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={reviewMutation.isPending || !rejectionReason.trim()}
                      onClick={() => handleReject(selectedUser.id)}
                      className="gap-1.5"
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      <span>{isArabic ? "تأكيد الرفض" : "Confirm Rejection"}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {isArabic ? "الحالة الحالية:" : "Current Status:"}
                    </span>
                    <span className="font-semibold capitalize text-foreground">
                      {selectedUser.identityVerificationStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={reviewMutation.isPending}
                      onClick={() => setRejectingMode(true)}
                      className="gap-1.5 border-red-500/40 text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                    >
                      <XCircle className="size-4 text-red-600 dark:text-red-400" />
                      <span>{isArabic ? "رفض المستند" : "Reject"}</span>
                    </Button>

                    <Button
                      type="button"
                      disabled={reviewMutation.isPending}
                      onClick={() => handleApprove(selectedUser.id)}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <BadgeCheck className="size-4" />
                      )}
                      <span>{isArabic ? "اعتماد وتوثيق" : "Approve & Verify"}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
