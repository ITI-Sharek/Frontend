import type { LucideIcon } from "lucide-react";

export type SignupRole = "contributor" | "owner";

export interface RoleOption {
  value: SignupRole;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface ChipOption {
  value: string;
  label: string;
}

export interface SignupFormData {
  role: SignupRole | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;

  contributorSkills: string;
  contributorExperience: string;
  contributorInterests: string[];
  contributorGithubUrl: string;

  ownerOrganization: string;
  ownerIndustry: string;
  ownerTeamSize: string;
  ownerWebsite: string;
}

export const INITIAL_SIGNUP_FORM_DATA: SignupFormData = {
  role: null,
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  agreedToTerms: false,

  contributorSkills: "",
  contributorExperience: "",
  contributorInterests: [],
  contributorGithubUrl: "",

  ownerOrganization: "",
  ownerIndustry: "",
  ownerTeamSize: "",
  ownerWebsite: "",
};
