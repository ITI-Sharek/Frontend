import { useState } from "react";

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
          العنوان
        </label>
        <input
          id="discussion-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="min-h-11 w-full rounded-input border border-border bg-input-bg px-3 text-sm text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="عنوان يلخّص الموضوع"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discussion-body" className="text-sm font-medium text-foreground">
          المحتوى
        </label>
        <textarea
          id="discussion-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          className="w-full resize-y rounded-input border border-border bg-input-bg p-3 text-sm leading-6 text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="شارك خبرتك أو اطرح سؤالاً على مجتمع Sharek"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {isSubmitting ? "جارٍ النشر..." : "نشر"}
        </Button>
      </div>
    </form>
  );
}
