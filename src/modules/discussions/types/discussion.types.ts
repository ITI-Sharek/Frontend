export type DiscussionAuthorRole = "owner" | "contributor";

export interface DiscussionAuthorDto {
  id: string;
  displayName: string;
  role: DiscussionAuthorRole;
  avatarUrl: string | null;
}

export interface DiscussionCommentDto {
  id: string;
  author: DiscussionAuthorDto;
  body: string;
  createdAt: string;
}

export interface DiscussionPostDto {
  id: string;
  title: string;
  excerpt: string;
  author: DiscussionAuthorDto;
  publishedAt: string;
  commentCount: number;
}

export interface DiscussionPostDetailDto extends DiscussionPostDto {
  body: string;
  comments: DiscussionCommentDto[];
}

export interface CreateDiscussionPostInput {
  title: string;
  body: string;
  author: DiscussionAuthorDto;
}

export interface AddDiscussionCommentInput {
  postId: string;
  body: string;
  author: DiscussionAuthorDto;
}
