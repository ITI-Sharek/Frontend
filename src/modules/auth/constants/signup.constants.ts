import { Briefcase, Users } from "lucide-react";
import type { TFunction } from "i18next";

import type { ChipOption, RoleOption } from "../types/signup.types";

export function getSignupSteps(t: TFunction) {
  return [
    t("register.steps.role"),
    t("register.steps.account"),
    t("register.steps.details"),
  ];
}

// POST /auth/register now requires a username and
// GET /auth/username-availability checks the same backend policy.
export const REGISTER_USERNAME_FIELD_ENABLED = true as boolean;

export function getRoleOptions(t: TFunction): RoleOption[] {
  return [
  {
    value: "contributor",
    title: t("auth.role.contributor"),
    description: t("register.role.contributorDescription"),
    icon: Users,
  },
  {
    value: "owner",
    title: t("auth.role.owner"),
    description: t("register.role.ownerDescription"),
    icon: Briefcase,
  },
  ];
}

export function getTeamSizeOptions(t: TFunction): ChipOption[] {
  return [
    { value: "solo", label: t("register.details.teamSizes.solo") },
    { value: "small", label: "2 - 10" },
    { value: "medium", label: "11 - 50" },
    { value: "large", label: t("register.details.teamSizes.large") },
  ];
}

export function getAvailabilityOptions(t: TFunction): ChipOption[] {
  return [
    { value: "full-time", label: t("register.details.availability.fullTime") },
    { value: "freelance", label: t("register.details.availability.freelance") },
    { value: "both", label: t("register.details.availability.both") },
  ];
}

export function getInterestOptions(t: TFunction): ChipOption[] {
  return [
  { value: "web", label: t("register.details.interestsOptions.web") },
  { value: "mobile", label: t("register.details.interestsOptions.mobile") },
  { value: "ai", label: t("register.details.interestsOptions.ai") },
  { value: "design", label: "UI/UX" },
  { value: "devops", label: "DevOps" },
  { value: "docs", label: t("register.details.interestsOptions.docs") },
  ];
}
