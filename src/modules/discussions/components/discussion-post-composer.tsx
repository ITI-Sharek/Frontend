import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

export function DiscussionPostComposer({
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  isSubmitting: boolean;
  onSubmit: (input: { title: string; body: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const canSubmit = title.trim() !== "" && body.trim() !== "" && !isSubmitting;

  return (
    <form
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({ title: title.trim(), body: body.trim() });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="discussion-title" className="text-sm font-medium text-foreground">
          {t("discussions.composer.titleLabel")}
        </label>
        <input
          id="discussion-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="min-h-11 w-full rounded-input border border-border bg-input-bg px-3 text-sm text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary"
          placeholder={t("discussions.composer.titlePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discussion-body" className="text-sm font-medium text-foreground">
          {t("discussions.composer.bodyLabel")}
        </label>
        <textarea
          id="discussion-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          className="w-full resize-y rounded-input border border-border bg-input-bg p-3 text-sm leading-6 text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary"
          placeholder={t("discussions.composer.bodyPlaceholder")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {isSubmitting ? t("discussions.composer.publishing") : t("common.publish")}
        </Button>
      </div>
    </form>
  );
}
