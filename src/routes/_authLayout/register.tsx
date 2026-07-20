import { createFileRoute } from "@tanstack/react-router";

import { AuthHero, RegisterForm } from "@/modules/auth";
import type { ContributorSignupDetails } from "@/modules/auth";
import {
  ensureCurrentContributorProfile,
  listContributorFields,
  updateContributorProfileDetails,
} from "@/modules/contributors";

export const Route = createFileRoute("/_authLayout/register")({
  head: () => ({
    meta: [{ title: "إنشاء حساب جديد | Sharek" }],
  }),
  component: RegisterPage,
});

async function persistContributorSignupDetails(
  details: ContributorSignupDetails,
) {
  const profile = await ensureCurrentContributorProfile();
  const fields = await listContributorFields();
  const selectedKeys = new Set(details.interests);
  const experienceRange = {
    junior: "zero_to_one",
    mid: "two_to_four",
    senior: "five_to_ten",
    expert: "ten_plus",
  }[details.experienceLevel] as
    | "zero_to_one"
    | "two_to_four"
    | "five_to_ten"
    | "ten_plus"
    | undefined;

  await updateContributorProfileDetails({
    bio: profile.bio,
    availability: profile.availability,
    experienceRange: experienceRange ?? null,
    fieldIds: fields
      .filter((field) => selectedKeys.has(field.key))
      .map((field) => field.id),
    declaredSkills: details.skills,
  });
}

function RegisterPage() {
  return (
    <>
      <AuthHero
        heading="إنشاء حساب جديد"
        subtext="انضم إلى مجتمع المطورين والخبراء التقنيين"
      />
      <RegisterForm
        onContributorDetailsCollected={persistContributorSignupDetails}
      />
    </>
  );
}
