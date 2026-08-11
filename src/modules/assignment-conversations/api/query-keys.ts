export const assignmentConversationKeys = {
  all: ["assignment-conversations"] as const,
  lists: () => ["assignment-conversations", "list"] as const,
  list: () => ["assignment-conversations", "list"] as const,
  detail: (conversationId: string) =>
    ["assignment-conversations", "detail", conversationId] as const,
  messageLists: () => ["assignment-conversations", "messages"] as const,
  conversationMessages: (conversationId: string) =>
    ["assignment-conversations", "messages", conversationId] as const,
  messages: (conversationId: string, query = "") =>
    ["assignment-conversations", "messages", conversationId, query] as const,
};
