/** Normalizes a comma-separated input into unique, trimmed, non-empty items. */
export function parseFieldList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    ),
  );
}

export function formatFieldList(items: string[]): string {
  return items.join(", ");
}
