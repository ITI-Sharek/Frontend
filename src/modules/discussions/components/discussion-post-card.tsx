import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Avatar } from "@/shared/components/ui/avatar";

import type { DiscussionPostDto } from "../types/discussion.types";

const ROLE_LABEL = {
  owner: "صاحب مشروع",
  contributor: "مساهم",
} as const;

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function DiscussionPostCard({ post }: { post: DiscussionPostDto }) {
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
            {ROLE_LABEL[post.author.role]} · {formatPublishedAt(post.publishedAt)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {post.excerpt}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" aria-hidden />
        {post.commentCount} تعليق
      </p>
    </Link>
  );
}
