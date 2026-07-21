import type {
  AddDiscussionCommentInput,
  CreateDiscussionPostInput,
  DiscussionPostDetailDto,
  DiscussionPostDto,
} from "../types/discussion.types";

/**
 * MOCK SERVICE — no discussions endpoint exists in the backend yet.
 * Posts/comments live in memory only and reset on reload; `createDiscussionPost`
 * and `addDiscussionComment` simulate a write so the composer UI can be
 * exercised, but nothing here persists across sessions or other clients.
 * Replace with real `/discussions` endpoints once the backend contract lands.
 */

const MOCK_AUTHORS = {
  sara: {
    id: "user-owner-1",
    displayName: "سارة يوسف",
    role: "owner" as const,
    avatarUrl: null,
  },
  omar: {
    id: "user-contributor-1",
    displayName: "عمر خالد",
    role: "contributor" as const,
    avatarUrl: null,
  },
};

const MOCK_POSTS: DiscussionPostDetailDto[] = [
  {
    id: "post-1",
    title: "كيف تكتب وصف مهمة يجذب المساهم المناسب؟",
    excerpt:
      "نطاق عمل واضح ومعايير مراجعة معلنة يقللان الغموض قبل أن يتقدم أحد.",
    body: "نطاق عمل واضح ومعايير مراجعة معلنة يقللان الغموض قبل أن يتقدم أحد. جرّبنا في هذا المشروع كتابة كل مهمة بثلاثة أسطر: ما المطلوب، كيف نراجعه، وما الدليل المتوقع. النتيجة كانت تقليل الأسئلة المتكررة إلى النصف تقريبًا.",
    author: MOCK_AUTHORS.sara,
    publishedAt: "2026-07-15T09:30:00.000Z",
    commentCount: 2,
    comments: [
      {
        id: "comment-1",
        author: MOCK_AUTHORS.omar,
        body: "هذا بالضبط ما كنت أبحث عنه، شكرًا على المشاركة.",
        createdAt: "2026-07-15T12:00:00.000Z",
      },
      {
        id: "comment-2",
        author: MOCK_AUTHORS.sara,
        body: "سعيدة أنه أفادك! لو جربته أخبرني بالنتيجة.",
        createdAt: "2026-07-16T08:15:00.000Z",
      },
    ],
  },
  {
    id: "post-2",
    title: "تجربتي في توثيق أول مساهمة مفتوحة المصدر",
    excerpt: "الدليل المكتوب أثناء العمل أسهل من إعادة بنائه لاحقًا.",
    body: "الدليل المكتوب أثناء العمل أسهل من إعادة بنائه لاحقًا. بدل ما أجمع لقطات الشاشة والشرح في آخر يوم، صرت أكتب ملاحظة قصيرة بعد كل خطوة مهمة. لما وصلت لمراجعة صاحب المشروع كان عندي سجل جاهز.",
    author: MOCK_AUTHORS.omar,
    publishedAt: "2026-07-18T14:00:00.000Z",
    commentCount: 0,
    comments: [],
  },
];

let nextPostId = MOCK_POSTS.length + 1;
let nextCommentId =
  MOCK_POSTS.reduce((count, post) => count + post.comments.length, 0) + 1;

function toSummary(post: DiscussionPostDetailDto): DiscussionPostDto {
  const { body: _body, comments: _comments, ...summary } = post;
  return summary;
}

export async function listDiscussionPosts(): Promise<DiscussionPostDto[]> {
  return Promise.resolve(
    [...MOCK_POSTS]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(toSummary),
  );
}

export async function getDiscussionPost(
  postId: string,
): Promise<DiscussionPostDetailDto | null> {
  const post = MOCK_POSTS.find((item) => item.id === postId);
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

  MOCK_POSTS.unshift(post);
  return Promise.resolve(post);
}

export async function addDiscussionComment(
  input: AddDiscussionCommentInput,
): Promise<DiscussionPostDetailDto> {
  const post = MOCK_POSTS.find((item) => item.id === input.postId);
  if (!post) {
    throw new Error("المنشور غير موجود.");
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
