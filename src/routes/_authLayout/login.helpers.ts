import type { AuthUserDto } from "@/modules/auth";

export function shouldEnsureContributorProfile(user: AuthUserDto): boolean {
  return user.role === "contributor";
}
