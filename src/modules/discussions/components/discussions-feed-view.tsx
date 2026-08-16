import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

import { useCreateDiscussionPostMutation } from "../api/mutations/use-create-discussion-post-mutation";
import { useDiscussionPostsQuery } from "../api/queries/use-discussion-posts-query";
import { DiscussionPostCard } from "./discussion-post-card";
import { DiscussionPostComposer } from "./discussion-post-composer";
import type { DiscussionAuthorDto } from "../types/discussion.types";

export function DiscussionsFeedView({
  currentAuthor,
}: {
  currentAuthor: DiscussionAuthorDto;
}) {
  const { t } = useTranslation();
  const postsQuery = useDiscussionPostsQuery();
  const createMutation = useCreateDiscussionPostMutation();
  const [isComposing, setIsComposing] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("discussions.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("discussions.description")}
          </p>
        </div>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              {t("discussions.newPost")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
            <DialogHeader className="block">
              <DialogTitle>{t("discussions.newPost")}</DialogTitle>
              <DialogDescription>
                {t("discussions.panelDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5">
              <DiscussionPostComposer
                isSubmitting={createMutation.isPending}
                onCancel={() => setIsComposing(false)}
                onSubmit={(input) => {
                  createMutation.mutate(
                    { ...input, author: currentAuthor },
                    { onSuccess: () => setIsComposing(false) },
                  );
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {postsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">{t("discussions.loading")}</p>
      ) : postsQuery.data.length === 0 ? (
        <p className="rounded-card border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t("discussions.empty")}
        </p>
      ) : (
        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto overscroll-contain pe-1">
          <div className="flex flex-col gap-3">
            {postsQuery.data.map((post) => (
              <DiscussionPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
