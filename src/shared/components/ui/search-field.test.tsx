// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchField } from "./search-field";

describe("SearchField", () => {
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

  it("provides the shared search input, clear control, and submit button", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const onSearch = vi.fn();

    await act(async () => {
      root.render(
        <SearchField
          value="React"
          onChange={onChange}
          onClear={onClear}
          onSearch={onSearch}
          searchLabel="Search projects"
          clearSearchLabel="Clear search"
          searchButtonLabel="Search"
          placeholder="Search by name"
        />,
      );
    });

    const form = container.querySelector<HTMLFormElement>('form[role="search"]');
    const input = container.querySelector<HTMLInputElement>('input[type="search"]');
    const submit = container.querySelector<HTMLButtonElement>('button[type="submit"]');
    const clear = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Clear search"]',
    );

    expect(form).not.toBeNull();
    expect(input?.placeholder).toBe("Search by name");
    expect(submit?.textContent).toBe("Search");
    expect(clear).not.toBeNull();

    await act(async () => {
      input?.dispatchEvent(new Event("input", { bubbles: true }));
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      clear?.click();
    });

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
