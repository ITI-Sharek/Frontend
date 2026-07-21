export const discussionsQueryKeys = {
  all: ["discussions"] as const,
  list: () => [...discussionsQueryKeys.all, "list"] as const,
  detail: (postId: string) => [...discussionsQueryKeys.all, "detail", postId] as const,
};
