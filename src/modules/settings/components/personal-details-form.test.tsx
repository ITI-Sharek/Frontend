// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUserDto } from "@/modules/auth";
import { PersonalDetailsForm } from "./personal-details-form";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockUser: AuthUserDto = {
  id: "user-1",
  email: "karim@example.com",
  username: "karimmohamed",
  firstName: "Karim",
  lastName: "Mohamed",
  country: "egypt",
  region: "cairo",
  city: "cairo",
  avatarUrl: "https://example.com/avatar.jpg",
  role: "contributor",
  status: "active",
  preferredLanguage: "ar",
  createdAt: "2026-08-09T00:00:00.000Z",
  updatedAt: "2026-08-09T00:00:00.000Z",
  lastLoginAt: null,
};

describe("PersonalDetailsForm location cascading", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it("renders with initial normalized country and cascaded options", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalDetailsForm user={mockUser} />
        </QueryClientProvider>,
      );
    });

    const countrySelect = container.querySelector<HTMLSelectElement>("#personal-country");
    const regionSelect = container.querySelector<HTMLSelectElement>("#personal-region");
    const citySelect = container.querySelector<HTMLSelectElement>("#personal-city");

    expect(countrySelect).not.toBeNull();
    expect(regionSelect).not.toBeNull();
    expect(citySelect).not.toBeNull();

    expect(countrySelect?.value).toBe("EG");
    expect(regionSelect?.value).toBe("C");
    expect(citySelect?.value).toBe("Cairo");
  });

  it("updates region and city options when selecting UAE (Emirates)", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalDetailsForm user={mockUser} />
        </QueryClientProvider>,
      );
    });

    const countrySelect = container.querySelector<HTMLSelectElement>("#personal-country");
    expect(countrySelect).not.toBeNull();

    // Select UAE ("AE")
    await act(async () => {
      if (countrySelect) {
        countrySelect.value = "AE";
        countrySelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    const regionSelect = container.querySelector<HTMLSelectElement>("#personal-region");
    const citySelect = container.querySelector<HTMLSelectElement>("#personal-city");

    // The region should now be one of UAE's emirates (e.g., Abu Dhabi AZ or Dubai DU)
    expect(countrySelect?.value).toBe("AE");
    expect(["AZ", "AJ", "DU", "FU", "RK", "SH", "UQ"]).toContain(regionSelect?.value);

    // Check region select options: they should contain UAE emirates, NOT Egyptian governorates
    const regionOptionValues = Array.from(regionSelect?.options ?? []).map((o) => o.value);
    expect(regionOptionValues).toContain("DU");
    expect(regionOptionValues).toContain("AZ");
    expect(regionOptionValues).toContain("SH");
    expect(regionOptionValues).not.toContain("ALX");

    // Check region options text in Arabic mode (contains Dubai / Abu Dhabi in Arabic)
    const regionOptionTexts = Array.from(regionSelect?.options ?? []).map((o) => o.textContent);
    expect(regionOptionTexts.some((t) => t.includes("دبي") || t.includes("Dubai"))).toBe(true);
    expect(regionOptionTexts.some((t) => t.includes("أبو ظبي") || t.includes("Abu Dhabi"))).toBe(true);

    // City should be updated to a city in UAE (not Cairo)
    expect(citySelect?.value).not.toBe("Cairo");
    expect(citySelect?.value).not.toBe("");
  });

  it("updates city options when changing emirate / region to Dubai", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalDetailsForm user={{ ...mockUser, country: "AE", region: "AZ" }} />
        </QueryClientProvider>,
      );
    });

    const countrySelect = container.querySelector<HTMLSelectElement>("#personal-country");
    const regionSelect = container.querySelector<HTMLSelectElement>("#personal-region");

    expect(countrySelect?.value).toBe("AE");

    // Change region to Dubai ("DU")
    await act(async () => {
      if (regionSelect) {
        regionSelect.value = "DU";
        regionSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    const citySelect = container.querySelector<HTMLSelectElement>("#personal-city");
    expect(citySelect?.value).toBe("Dubai");
  });

  it("resyncs dependent location fields when the saved user changes", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalDetailsForm user={mockUser} />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <PersonalDetailsForm
            user={{ ...mockUser, country: "AE", region: "DU", city: "Dubai" }}
          />
        </QueryClientProvider>,
      );
    });

    expect(container.querySelector<HTMLSelectElement>("#personal-country")?.value).toBe("AE");
    expect(container.querySelector<HTMLSelectElement>("#personal-region")?.value).toBe("DU");
    expect(container.querySelector<HTMLSelectElement>("#personal-city")?.value).toBe("Dubai");
  });
});
