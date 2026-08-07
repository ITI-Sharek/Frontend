export { AuthHero } from "./components/auth-hero";
export { RegisterForm } from "./components/register-form";
export type { ContributorSignupDetails } from "./components/register-form";
export { LoginForm } from "./components/login-form";
export { ForgotPasswordForm } from "./components/forgot-password-form";
export { useLogoutMutation } from "./api/mutations/use-logout-mutation";
export { useCurrentUserQuery } from "./api/queries/use-current-user-query";
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
} from "./services/auth.service";
export type {
  AuthSessionDto,
  AuthTokensDto,
  AuthUserDto,
  LoginPayload,
  RegisterPayload,
  UserRole,
} from "./types/auth.types";
