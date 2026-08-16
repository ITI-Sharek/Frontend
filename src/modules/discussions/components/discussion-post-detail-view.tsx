import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAddDiscussionCommentMutation } from "../api/mutations/use-add-discussion-comment-mutation";
import type {
  DiscussionAuthorDto,
  DiscussionPostDetailDto,
} from "../types/discussion.types";

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DiscussionPostDetailView({
  post,
  currentAuthor,
}: {
  post: DiscussionPostDetailDto;
  currentAuthor: DiscussionAuthorDto;
}) {
  const { i18n, t } = useTranslation();
  const commentMutation = useAddDiscussionCommentMutation();
  const [comment, setComment] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link
        to={ROUTES.discussions}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" aria-hidden />
        {t("discussions.back")}
      </Link>

      <article className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            size="md"
            fallback={post.author.displayName.slice(0, 1)}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {post.author.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(`discussions.roles.${post.author.role}`)} ·{" "}
              {formatDateTime(post.publishedAt, i18n.language)}
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {post.body}
        </p>
      </article>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">
          {t("discussions.commentsTitle", { count: post.comments.length })}
        </h2>

        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const body = comment.trim();
            if (body === "") return;
            commentMutation.mutate(
              { postId: post.id, body, author: currentAuthor },
              { onSuccess: () => setComment("") },
            );
          }}
        >
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            className="min-h-0 resize-y p-3"
            placeholder={t("discussions.commentPlaceholder")}
          />
          <Button
            type="submit"
            size="sm"
            className="self-end"
            disabled={comment.trim() === "" || commentMutation.isPending}
          >
            {commentMutation.isPending
              ? t("discussions.sending")
              : t("common.submit")}
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          {post.comments.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-input border border-border bg-card p-3.5"
            >
              <Avatar
                src={item.author.avatarUrl}
                alt={item.author.displayName}
                size="sm"
                fallback={item.author.displayName.slice(0, 1)}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {item.author.displayName}
                  </span>
                  · {formatDateTime(item.createdAt, i18n.language)}
                </p>
                <p className="mt-1 text-sm leading-6 text-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
