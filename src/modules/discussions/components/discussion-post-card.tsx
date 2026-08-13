import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Avatar } from "@/shared/components/ui/avatar";

import type { DiscussionPostDto } from "../types/discussion.types";

function formatPublishedAt(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function DiscussionPostCard({ post }: { post: DiscussionPostDto }) {
  const { i18n, t } = useTranslation();
  return (
    <Link
      to={ROUTES.discussion(post.id)}
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={post.author.avatarUrl}
          alt={post.author.displayName}
          size="sm"
          fallback={post.author.displayName.slice(0, 1)}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {post.author.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(`discussions.roles.${post.author.role}`)} ·{" "}
            {formatPublishedAt(post.publishedAt, i18n.language)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {post.excerpt}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" aria-hidden />
        {t("discussions.commentCount", { count: post.commentCount })}
      </p>
    </Link>
  );
}
