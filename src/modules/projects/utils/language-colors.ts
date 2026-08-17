/**
 * Language colours for the repository composition bar.
 *
 * These are the hues GitHub uses in `linguist`, which developers already read
 * fluently — a yellow band means JavaScript before anyone has read the legend.
 * Borrowing that vocabulary makes the bar informative instead of decorative,
 * which is the whole reason to draw it.
 *
 * Anything not on the list gets a stable colour derived from its name, so an
 * unfamiliar language is still distinguishable from its neighbours and keeps
 * the same colour on every card it appears on.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f1e05a",
  python: "#3572a5",
  java: "#b07219",
  kotlin: "#a97bff",
  swift: "#f05138",
  go: "#00add8",
  rust: "#dea584",
  ruby: "#701516",
  php: "#4f5d95",
  "c#": "#178600",
  csharp: "#178600",
  c: "#555555",
  "c++": "#f34b7d",
  cpp: "#f34b7d",
  dart: "#00b4ab",
  html: "#e34c26",
  css: "#563d7c",
  scss: "#c6538c",
  vue: "#41b883",
  svelte: "#ff3e00",
  shell: "#89e051",
  bash: "#89e051",
  dockerfile: "#384d54",
  makefile: "#427819",
  sql: "#e38c00",
  plpgsql: "#336790",
  hcl: "#844fba",
  lua: "#000080",
  elixir: "#6e4a7e",
  scala: "#c22d40",
  haskell: "#5e5086",
  r: "#198ce7",
  jupyter: "#da5b0b",
  "objective-c": "#438eff",
  perl: "#0298c3",
  powershell: "#012456",
  vim: "#199f4b",
  yaml: "#cb171e",
  json: "#a0a0a0",
  markdown: "#083fa1",
};

/** Deterministic fallback: same name always yields the same hue. */
function fallbackColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }
  return `hsl(${hash} 52% 48%)`;
}

export function getLanguageColor(name: string): string {
  return LANGUAGE_COLORS[name.trim().toLowerCase()] ?? fallbackColor(name);
}
