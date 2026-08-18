import type {
  ContributorDashboardDto,
} from "../types/dashboard.types";
import { axiosInstance } from "@/lib/axios/axios-instance";

export async function getContributorDashboard(): Promise<ContributorDashboardDto> {
  const { data } = await axiosInstance.get<ContributorDashboardDto>(
    "/contributors/me/dashboard",
  );
  return data;
}
