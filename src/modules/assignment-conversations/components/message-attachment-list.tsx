import { Ban, Download, Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { useAttachmentDownloadUrlMutation } from "../api/mutations/use-assignment-conversation-mutations";
import { getChatAttachmentErrorMessage } from "../constants/attachment-copy";
import type { ChatAttachmentDto } from "../types/assignment-conversation.types";
import { formatAttachmentByteSize } from "../utils/attachment-format";

export function MessageAttachmentList({
  conversationId,
  attachments,
}: {
  conversationId: string;
  attachments: ChatAttachmentDto[];
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {attachments.map((attachment) => (
        <MessageAttachmentItem
          key={attachment.attachmentId}
          conversationId={conversationId}
          attachment={attachment}
        />
      ))}
    </ul>
  );
}

function AttachmentRow({
  role,
  tone,
  icon,
  filename,
  children,
}: {
  role?: "status" | "note";
  tone: "muted" | "destructive";
  icon: ReactNode;
  filename: string;
  children: ReactNode;
}) {
  return (
    <li
      role={role}
      aria-live={role === "status" ? "polite" : undefined}
      className={`flex items-center gap-2 rounded-input border px-2.5 py-1.5 text-xs ${
        tone === "destructive"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-surface-fog text-muted-foreground"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-foreground">{filename}</span>
      {children}
    </li>
  );
}

function MessageAttachmentItem({
  conversationId,
  attachment,
}: {
  conversationId: string;
  attachment: ChatAttachmentDto;
}) {
  const { t, i18n } = useTranslation();
  const downloadMutation = useAttachmentDownloadUrlMutation();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // "scanning" renders no download control of any kind — not a disabled
  // button, so it never implies the file is already there.
  if (attachment.scanState === "scanning") {
    return (
      <AttachmentRow
        role="status"
        tone="muted"
        icon={
          <Loader2
            className="size-3.5 shrink-0 animate-spin"
            aria-hidden="true"
          />
        }
        filename={attachment.filename}
      >
        <span className="shrink-0">
          {t("assignmentConversations.attachments.scanning")}
        </span>
      </AttachmentRow>
    );
  }

  // Permanent tombstone, no retry affordance of any kind.
  if (attachment.scanState === "blocked") {
    return (
      <AttachmentRow
        role="note"
        tone="destructive"
        icon={<Ban className="size-3.5 shrink-0" aria-hidden="true" />}
        filename={attachment.filename}
      >
        <span className="shrink-0">
          {t("assignmentConversations.attachments.blocked")}
        </span>
      </AttachmentRow>
    );
  }

  // Never a malware claim: the scan was retried to the limit and never
  // produced a verdict. No retry affordance either.
  if (attachment.scanState === "unavailable") {
    return (
      <AttachmentRow
        role="note"
        tone="muted"
        icon={<ShieldAlert className="size-3.5 shrink-0" aria-hidden="true" />}
        filename={attachment.filename}
      >
        <span className="shrink-0">
          {t("assignmentConversations.attachments.scanUnavailable")}
        </span>
      </AttachmentRow>
    );
  }

  async function handleDownload() {
    setDownloadError(null);
    try {
      const result = await downloadMutation.mutateAsync({
        conversationId,
        attachmentId: attachment.attachmentId,
      });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setDownloadError(getChatAttachmentErrorMessage(t, error));
    }
  }

  return (
    <li className="flex items-center gap-2 rounded-input border border-border bg-surface-fog px-2.5 py-1.5 text-xs">
      <span className="min-w-0 flex-1 truncate">{attachment.filename}</span>
      <span className="shrink-0 text-muted-foreground">
        {formatAttachmentByteSize(i18n.language, attachment.byteSize)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={downloadMutation.isPending}
        aria-label={t("assignmentConversations.attachments.downloadAria", {
          filename: attachment.filename,
        })}
        onClick={() => void handleDownload()}
      >
        <Download className="size-3.5" aria-hidden="true" />
      </Button>
      {downloadError && (
        <span role="alert" className="shrink-0 text-destructive">
          {downloadError}
        </span>
      )}
    </li>
  );
}
