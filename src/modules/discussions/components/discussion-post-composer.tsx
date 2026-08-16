import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

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
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({ title: title.trim(), body: body.trim() });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="discussion-title"
          className="text-sm font-medium tracking-normal text-foreground"
        >
          {t("discussions.composer.titleLabel")}
        </Label>
        <Input
          id="discussion-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="h-11 min-h-11 px-3 text-sm"
          placeholder={t("discussions.composer.titlePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="discussion-body"
          className="text-sm font-medium tracking-normal text-foreground"
        >
          {t("discussions.composer.bodyLabel")}
        </Label>
        <Textarea
          id="discussion-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          className="resize-y p-3"
          placeholder={t("discussions.composer.bodyPlaceholder")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {isSubmitting
            ? t("discussions.composer.publishing")
            : t("common.publish")}
        </Button>
      </div>
    </form>
  );
}
