import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AdminContributorFieldsPanel } from "./admin-contributor-fields-panel";
import { AdminExperienceLevelsPanel } from "./admin-experience-levels-panel";

const item = {
  id: "item-1",
  key: "web",
  labelAr: "الويب",
  labelEn: "Web",
  sortOrder: 1,
  active: true,
};

const category = {
  ...item,
  key: "engineering",
  fields: [{ ...item, categoryId: item.id }],
};

const mutation = {
  error: null,
  isPending: false,
  mutate: vi.fn(),
};

vi.mock("../api/queries/use-admin-contributor-fields-query", () => ({
  useAdminContributorFieldCategoriesQuery: () => ({
    data: [category],
    error: null,
    isError: false,
    isPending: false,
  }),
  useCreateContributorFieldCategoryMutation: () => mutation,
  useCreateContributorFieldMutation: () => mutation,
  useUpdateContributorFieldCategoryMutation: () => mutation,
  useUpdateContributorFieldMutation: () => mutation,
}));

vi.mock("../api/queries/use-admin-experience-levels-query", () => ({
  useAdminExperienceLevelsQuery: () => ({
    data: [item],
    error: null,
    isError: false,
    isPending: false,
  }),
  useCreateExperienceLevelMutation: () => mutation,
  useUpdateExperienceLevelMutation: () => mutation,
}));

describe("admin contributor taxonomy panels", () => {
  it("uses shared inputs for field and experience-level maintenance", () => {
    const html = renderToStaticMarkup(
      <>
        <AdminContributorFieldsPanel />
        <AdminExperienceLevelsPanel />
      </>,
    );

    expect(html.match(/data-slot="input"/g)).toHaveLength(12);
    expect(html).toContain('data-slot="native-select"');
    expect(html).toContain('name="categoryKey"');
    expect(html).toContain('name="fieldKey"');
    expect(html).toContain('name="levelKey"');
  });
});
