import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AuthHero, RegisterForm } from "@/modules/auth";
import type { ContributorSignupDetails } from "@/modules/auth";
import {
  ensureCurrentContributorProfile,
  listContributorFields,
  updateContributorProfileDetails,
  useExperienceLevelsQuery,
} from "@/modules/contributors";

export const Route = createFileRoute("/_authLayout/register")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  component: RegisterPage,
});

async function persistContributorSignupDetails(
  details: ContributorSignupDetails,
) {
  const profile = await ensureCurrentContributorProfile();
  const fields = await listContributorFields();
  const selectedKeys = new Set(details.interests);

  await updateContributorProfileDetails({
    bio: profile.bio,
    availability: profile.availability,
    experienceLevelId: details.experienceLevel || null,
    fieldIds: fields
      .filter((field) => selectedKeys.has(field.key))
      .map((field) => field.id),
    declaredSkills: details.skills,
  });
}

function RegisterPage() {
  const { t } = useTranslation();
  const experienceLevelsQuery = useExperienceLevelsQuery();

  return (
    <>
      <AuthHero
        heading={t("auth.registerHero")}
        subtext={t("auth.registerSubtext")}
      />
      <RegisterForm
        experienceLevelOptions={(experienceLevelsQuery.data ?? []).map(
          (level) => ({ value: level.id, label: level.labelAr }),
        )}
        isExperienceLevelsLoading={experienceLevelsQuery.isPending}
        onContributorDetailsCollected={persistContributorSignupDetails}
      />
    </>
  );
}
