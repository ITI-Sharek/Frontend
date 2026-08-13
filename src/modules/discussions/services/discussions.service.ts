import type {
  AddDiscussionCommentInput,
  CreateDiscussionPostInput,
  DiscussionPostDetailDto,
  DiscussionPostDto,
} from "../types/discussion.types";
import { activeLocale, translate } from "@/lib/translate";

/**
 * MOCK SERVICE — no discussions endpoint exists in the backend yet.
 * Posts/comments live in memory only and reset on reload; `createDiscussionPost`
 * and `addDiscussionComment` simulate a write so the composer UI can be
 * exercised, but nothing here persists across sessions or other clients.
 * Replace with real `/discussions` endpoints once the backend contract lands.
 */

function getMockAuthors() {
  return {
  sara: {
    id: "user-owner-1",
    displayName: translate("discussions.mock.sara"),
    role: "owner" as const,
    avatarUrl: null,
  },
  omar: {
    id: "user-contributor-1",
    displayName: translate("discussions.mock.omar"),
    role: "contributor" as const,
    avatarUrl: null,
  },
  };
}

function createMockPosts(): DiscussionPostDetailDto[] {
  const authors = getMockAuthors();
  return [
  {
    id: "post-1",
    title: translate("discussions.mock.post1.title"),
    excerpt: translate("discussions.mock.post1.excerpt"),
    body: translate("discussions.mock.post1.body"),
    author: authors.sara,
    publishedAt: "2026-07-15T09:30:00.000Z",
    commentCount: 2,
    comments: [
      {
        id: "comment-1",
        author: authors.omar,
        body: translate("discussions.mock.post1.comment1"),
        createdAt: "2026-07-15T12:00:00.000Z",
      },
      {
        id: "comment-2",
        author: authors.sara,
        body: translate("discussions.mock.post1.comment2"),
        createdAt: "2026-07-16T08:15:00.000Z",
      },
    ],
  },
  {
    id: "post-2",
    title: translate("discussions.mock.post2.title"),
    excerpt: translate("discussions.mock.post2.excerpt"),
    body: translate("discussions.mock.post2.body"),
    author: authors.omar,
    publishedAt: "2026-07-18T14:00:00.000Z",
    commentCount: 0,
    comments: [],
  },
  ];
}

const postsByLocale: Record<"ar" | "en", DiscussionPostDetailDto[] | null> = {
  ar: null,
  en: null,
};

function getPosts(): DiscussionPostDetailDto[] {
  const locale = activeLocale();
  postsByLocale[locale] ??= createMockPosts();
  return postsByLocale[locale];
}

let nextPostId = 3;
let nextCommentId =
  3;

function toSummary(post: DiscussionPostDetailDto): DiscussionPostDto {
  const { body: _body, comments: _comments, ...summary } = post;
  return summary;
}

export async function listDiscussionPosts(): Promise<DiscussionPostDto[]> {
  return Promise.resolve(
    [...getPosts()]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(toSummary),
  );
}

export async function getDiscussionPost(
  postId: string,
): Promise<DiscussionPostDetailDto | null> {
  const post = getPosts().find((item) => item.id === postId);
  return Promise.resolve(post ? { ...post, comments: [...post.comments] } : null);
}

export async function createDiscussionPost(
  input: CreateDiscussionPostInput,
): Promise<DiscussionPostDetailDto> {
  const post: DiscussionPostDetailDto = {
    id: `post-${nextPostId++}`,
    title: input.title,
    excerpt: input.body.slice(0, 140),
    body: input.body,
    author: input.author,
    publishedAt: new Date().toISOString(),
    commentCount: 0,
    comments: [],
  };

  getPosts().unshift(post);
  return Promise.resolve(post);
}

export async function addDiscussionComment(
  input: AddDiscussionCommentInput,
): Promise<DiscussionPostDetailDto> {
  const post = getPosts().find((item) => item.id === input.postId);
  if (!post) {
    throw new Error(translate("discussions.mock.postNotFound"));
  }

  post.comments.push({
    id: `comment-${nextCommentId++}`,
    author: input.author,
    body: input.body,
    createdAt: new Date().toISOString(),
  });
  post.commentCount = post.comments.length;

  return Promise.resolve({ ...post, comments: [...post.comments] });
}
