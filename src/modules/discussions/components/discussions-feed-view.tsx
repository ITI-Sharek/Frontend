import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

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
  const postsQuery = useDiscussionPostsQuery();
  const createMutation = useCreateDiscussionPostMutation();
  const [isComposing, setIsComposing] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">النقاشات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مقالات وخبرات يشاركها أصحاب المشاريع والمساهمون، مع تعليقات مفتوحة.
          </p>
        </div>
        {!isComposing && (
          <Button size="sm" onClick={() => setIsComposing(true)}>
            <Plus className="size-4" aria-hidden />
            منشور جديد
          </Button>
        )}
      </div>

      {isComposing && (
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
      )}

      {postsQuery.data === undefined ? (
        <p className="text-sm text-muted-foreground">جارٍ تحميل النقاشات...</p>
      ) : postsQuery.data.length === 0 ? (
        <p className="rounded-card border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          لا توجد منشورات بعد. كن أول من يبدأ نقاشًا.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {postsQuery.data.map((post) => (
            <DiscussionPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
