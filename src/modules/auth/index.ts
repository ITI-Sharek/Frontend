export { AuthHero } from "./components/auth-hero";
export { RegisterForm } from "./components/register-form";
export type { ContributorSignupDetails } from "./components/register-form";
export { LoginForm } from "./components/login-form";
export { ForgotPasswordForm } from "./components/forgot-password-form";
export { LanguageSettingsSection } from "./components/language-settings-section";
export { useLogoutMutation } from "./api/mutations/use-logout-mutation";
export { useUpdateCurrentUserPreferencesMutation } from "./api/mutations/use-current-user-preferences-mutation";
export { useCurrentUserQuery } from "./api/queries/use-current-user-query";
export {
  useChangePasswordMutation, useExportAccountDataMutation, useUpdateEmailMutation,
  useUpdatePersonalDetailsMutation, useUpdatePhoneMutation, useUpdatePrivacyMutation,
  useUpdateUsernameMutation, useUploadIdentityDocumentMutation,
} from "./api/mutations/use-account-settings-mutations";
export { useUsernameAvailabilityQuery } from "./api/queries/use-username-availability-query";
export { useResolvedCurrentUser } from "./hooks/use-resolved-current-user";
export {
  requireAdminRoute,
  requireContributorRoute,
  requireMemberRoute,
  requireOwnerRoute,
  requireRouteAccess,
} from "./routing/route-access";
export type { RouteAccessContext } from "./routing/route-access";
export {
  assignUserRole,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updateCurrentUserPreferences,
} from "./services/auth.service";
export type {
  AuthSessionDto,
  AuthTokensDto,
  AuthUserDto,
  LoginPayload,
  RegisterPayload,
  UpdateCurrentUserPreferencesDto,
  UpdatePersonalDetailsDto,
  UpdatePrivacyDto,
  UserRole,
} from "./types/auth.types";
