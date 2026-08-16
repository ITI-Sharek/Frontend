// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExploreFilters } from "./explore-filters";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("ExploreFilters", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("uses accessible single-value radio groups and preserves filter updates", async () => {
    const onChange = vi.fn();
    await act(async () => {
      root.render(
        <ExploreFilters params={{}} onChange={onChange} onReset={vi.fn()} />,
      );
    });

    expect(container.querySelectorAll('[role="radiogroup"]')).toHaveLength(2);
    const aiCategory = container.querySelector<HTMLButtonElement>(
      '[role="radio"][data-filter-value="ai_ml"]',
    );
    if (!aiCategory) throw new Error("Expected AI category radio");
    await act(async () => aiCategory.click());

    expect(onChange).toHaveBeenCalledWith({ category: "ai_ml" });
  });
});
