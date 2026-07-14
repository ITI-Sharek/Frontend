import { createFileRoute } from "@tanstack/react-router";

import { AuthHero, RegisterForm } from "@/modules/auth";
import type { ContributorSignupDetails } from "@/modules/auth";
import {
  ensureCurrentContributorProfile,
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
  await updateContributorProfileDetails(profile, {
    bio: profile.bio,
    availability: profile.availability,
    experienceLevel: details.experienceLevel || null,
    interests: details.interests,
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
