import type {
  ContributorExperienceLevelDto,
  ContributorFieldDto,
  ContributorProfileDto,
} from "../types/contributor-profile.types";
import { API_BASE_URL } from "@/config/env";
import { axiosInstance } from "@/lib/axios/axios-instance";

export interface UpdateProfileDetailsPayload {
  bio?: string | null;
  availability?: string | null;
  experienceLevelId?: string | null;
  fieldIds?: string[];
  declaredSkills?: string[];
}

function normalizeProfileAssetUrls(
  profile: ContributorProfileDto,
): ContributorProfileDto {
  if (!profile.avatarUrl?.startsWith("/")) return profile;
  return { ...profile, avatarUrl: `${API_BASE_URL}${profile.avatarUrl}` };
}

export async function updateContributorProfileDetails(
  payload: UpdateProfileDetailsPayload,
): Promise<ContributorProfileDto> {
  const { data } = await axiosInstance.patch<ContributorProfileDto>(
    "/contributors/profiles/me",
    payload,
  );
  return normalizeProfileAssetUrls(data);
}

export async function listContributorFields(): Promise<ContributorFieldDto[]> {
  const { data } = await axiosInstance.get<ContributorFieldDto[]>(
    "/contributors/profile-fields",
  );
  return data;
}

export async function listExperienceLevels(): Promise<
  ContributorExperienceLevelDto[]
> {
  const { data } = await axiosInstance.get<ContributorExperienceLevelDto[]>(
    "/contributors/experience-levels",
  );
  return data;
}

export async function uploadContributorAvatar(
  file: File,
): Promise<ContributorProfileDto> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await axiosInstance.put<ContributorProfileDto>(
    "/contributors/profiles/me/avatar",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return normalizeProfileAssetUrls(data);
}

export interface SkillsGenerationRequestResult {
  status: "queued";
  message: string;
}

export async function requestSkillsGeneration(): Promise<SkillsGenerationRequestResult> {
  return {
    status: "queued",
    message:
      "بدأ تحليل نشاطك على GitHub. ستظهر المهارات هنا بعد اكتمال التحليل ومراجعة الفريق.",
  };
}
