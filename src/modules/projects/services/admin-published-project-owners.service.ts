import { axiosInstance } from "@/lib/axios/axios-instance";

import type { AdminPublishedProjectOwnerDto } from "../types/admin-published-project-owner.types";

export async function listAdminPublishedProjectOwners() {
  const { data } = await axiosInstance.get<AdminPublishedProjectOwnerDto[]>(
    "/admin/published-project-owners",
  );
  return data;
}
