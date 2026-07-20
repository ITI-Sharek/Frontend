import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  createAdminContributorField,
  listAdminContributorFields,
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
  key: "web-development",
  labelEn: "Web development",
  labelAr: "تطوير الويب",
  active: true,
  sortOrder: 1,
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
      key: field.key,
      labelEn: field.labelEn,
      labelAr: field.labelAr,
    });
    await updateAdminContributorField(field.id, { active: false });

    expect(mockedAxios.post).toHaveBeenCalledWith("/admin/contributor-fields", {
      key: field.key,
      labelEn: field.labelEn,
      labelAr: field.labelAr,
    });
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/admin/contributor-fields/field-1",
      { active: false },
    );
  });
});
