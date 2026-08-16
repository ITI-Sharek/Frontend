import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  createAdminContributorFieldCategory,
  createAdminContributorField,
  listAdminContributorFieldCategories,
  listAdminContributorFields,
  updateAdminContributorFieldCategory,
  updateAdminContributorField,
} from "./admin-contributor-fields.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);
const field = {
  id: "field-1",
  categoryId: "category-1",
  key: "web-development",
  labelEn: "Web development",
  labelAr: "تطوير الويب",
  active: true,
  sortOrder: 1,
  category: {
    id: "category-1",
    key: "technology",
    labelEn: "Technology",
    labelAr: "التكنولوجيا",
  },
};
const category = {
  id: "category-1",
  key: "technology",
  labelEn: "Technology",
  labelAr: "التكنولوجيا",
  active: true,
  sortOrder: 1,
  fields: [field],
};

describe("admin contributor fields service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads active and inactive contributor fields for admins", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [field] });

    await expect(listAdminContributorFields()).resolves.toEqual([field]);
    expect(mockedAxios.get).toHaveBeenCalledWith("/admin/contributor-fields");
  });

  it("creates and updates fields through the admin contract", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: field });
    mockedAxios.patch.mockResolvedValueOnce({ data: { ...field, active: false } });

    await createAdminContributorField({
      categoryId: field.categoryId,
      key: field.key,
      labelEn: field.labelEn,
      labelAr: field.labelAr,
    });
    await updateAdminContributorField(field.id, { active: false });

    expect(mockedAxios.post).toHaveBeenCalledWith("/admin/contributor-fields", {
      categoryId: field.categoryId,
      key: field.key,
      labelEn: field.labelEn,
      labelAr: field.labelAr,
    });
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/admin/contributor-fields/field-1",
      { active: false },
    );
  });

  it("manages categories and loads their nested fields", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [category] });
    mockedAxios.post.mockResolvedValueOnce({ data: category });
    mockedAxios.patch.mockResolvedValueOnce({ data: { ...category, active: false } });

    await expect(listAdminContributorFieldCategories()).resolves.toEqual([category]);
    await createAdminContributorFieldCategory({
      key: category.key,
      labelEn: category.labelEn,
      labelAr: category.labelAr,
    });
    await updateAdminContributorFieldCategory(category.id, { active: false });

    expect(mockedAxios.get).toHaveBeenCalledWith("/admin/contributor-field-categories");
    expect(mockedAxios.post).toHaveBeenCalledWith("/admin/contributor-field-categories", {
      key: category.key,
      labelEn: category.labelEn,
      labelAr: category.labelAr,
    });
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/admin/contributor-field-categories/category-1",
      { active: false },
    );
  });
});
