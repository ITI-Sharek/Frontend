/**
 * Selection is keyed by immutable GitHub repository IDs. Full names are display
 * only and are never submitted as authorization input.
 */
export function toggleRepositorySelection(
  selected: string[],
  repositoryId: string,
  maxSelected: number,
): string[] {
  if (selected.includes(repositoryId)) {
    return selected.filter((id) => id !== repositoryId);
  }
  if (selected.length >= maxSelected) {
    return selected;
  }
  return [...selected, repositoryId];
}

export function isRepositorySelectionValid(
  selected: string[],
  maxSelected: number,
): boolean {
  const unique = new Set(selected);
  return (
    selected.length >= 1 &&
    selected.length <= maxSelected &&
    unique.size === selected.length
  );
}
