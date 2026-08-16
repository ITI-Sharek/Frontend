// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NativeSelect, NativeSelectOption } from "./native-select";

describe("NativeSelect", () => {
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

  it("keeps native select semantics and logical RTL-safe icon placement", async () => {
    await act(async () => {
      root.render(
        <NativeSelect aria-label="Difficulty" defaultValue="advanced">
          <NativeSelectOption value="beginner">Beginner</NativeSelectOption>
          <NativeSelectOption value="advanced">Advanced</NativeSelectOption>
        </NativeSelect>,
      );
    });

    const select = container.querySelector<HTMLSelectElement>("select");
    const icon = container.querySelector<SVGElement>(
      '[data-slot="native-select-icon"]',
    );

    expect(select?.value).toBe("advanced");
    expect(select?.getAttribute("aria-label")).toBe("Difficulty");
    expect(select?.querySelectorAll("option")).toHaveLength(2);
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.getAttribute("class")).toContain("end-3.5");
  });
});
